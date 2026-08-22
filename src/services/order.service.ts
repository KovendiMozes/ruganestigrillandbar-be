import { prisma } from '@/config/db';

export type OrderStatus = 'ORDERED' | 'READY' | 'SERVED';

// In-memory version counter — increments on any order mutation
let ordersVersion = 0;
export function getOrdersVersion() { return ordersVersion; }
function bumpVersion() { ordersVersion += 1; }

function todayStr() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Bucharest' });
}

async function generateOrderNumber(date: string): Promise<number> {
  const used = await prisma.order.findMany({ where: { date }, select: { orderNumber: true } });
  const usedSet = new Set(used.map((o) => o.orderNumber));
  // Try 2-digit range first (10–99), fall back to 3-digit (100–999) if full
  const ranges = [{ min: 10, max: 99 }, { min: 100, max: 999 }];
  for (const { min, max } of ranges) {
    for (let i = 0; i < (max - min + 1) * 3; i++) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!usedSet.has(n)) return n;
    }
  }
  throw new Error('Nem sikerült egyedi rendelésszámot generálni');
}

// ─── Stored line format (IDs only, no computed display data) ─────────────────
export interface StoredLine {
  type: 'item' | 'custom';
  menuItemId?: string;
  customIngredients?: { ingredientDefId: string; qty: number }[];
  selectedOptions: { variationSetId: string; optionId: string; ingredientDefId: string; qty: number }[];
  extras: { ingredientDefId: string; qty: number; selectedOptions: { optionId: string; qty: number }[] }[];
}

// ─── Enriched line (computed from DB, sent to clients) ───────────────────────
export interface EnrichedLine {
  id: string;
  type: 'item' | 'custom';
  displayName: string;
  priceRon: number;
  totalPriceRon: number;
  variations: { setName: string; optionName: string; qty?: number; hideFromKitchen?: boolean }[];
  kitchenItems: { name: string; tag?: string; weightGr?: number; count?: number; qty?: number; hideFromKitchen?: boolean; representedInVariations?: boolean; typeName?: string; unit?: string }[];
  extras: { name: string; tag?: string; qty?: number; hideFromKitchen?: boolean; typeName?: string }[];
  rawData?: any;
}

// Detects new vs old (snapshot) lineData format
function isNewFormat(data: any): boolean {
  return 'selectedOptions' in data && ('menuItemId' in data || 'customIngredients' in data);
}

// Enrich a batch of orders (3 bulk DB queries regardless of order count)
async function enrichOrders(orders: { id: string; orderNumber: number; type: string; status: string; totalRon: number; note?: string | null; createdAt: Date; lines: { id: string; lineData: any; createdAt: Date }[] }[]) {
  const menuItemIds = new Set<string>();
  const ingredientDefIds = new Set<string>();
  const optionIds = new Set<string>();

  for (const order of orders) {
    for (const line of order.lines) {
      const d = line.lineData as any;
      if (!isNewFormat(d)) continue;
      if (d.menuItemId) menuItemIds.add(d.menuItemId);
      d.customIngredients?.forEach((ci: any) => ingredientDefIds.add(ci.ingredientDefId));
      d.selectedOptions?.forEach((o: any) => {
        optionIds.add(o.optionId);
        if (o.ingredientDefId) ingredientDefIds.add(o.ingredientDefId);
      });
      d.extras?.forEach((e: any) => {
        ingredientDefIds.add(e.ingredientDefId);
        e.selectedOptions?.forEach((o: any) => optionIds.add(o.optionId));
      });
    }
  }

  const [menuItems, ingredientDefs, variationOptions] = await Promise.all([
    menuItemIds.size > 0
      ? prisma.menuItem.findMany({
          where: { id: { in: [...menuItemIds] } },
          include: {
            ingredients: {
              include: {
                choices: {
                  include: { ingredientDef: { include: { type: true, unitType: true } }, variationOption: true },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        })
      : [],
    ingredientDefIds.size > 0
      ? prisma.ingredientDef.findMany({ where: { id: { in: [...ingredientDefIds] } }, include: { type: true, unitType: true } })
      : [],
    optionIds.size > 0
      ? prisma.variationOption.findMany({
          where: { id: { in: [...optionIds] } },
          include: { set: true },
        })
      : [],
  ]);

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
  const ingDefMap = new Map(ingredientDefs.map((i) => [i.id, i]));
  const optionMap = new Map(variationOptions.map((o) => [o.id, o]));

  return orders.map((order) => ({
    ...order,
    lines: order.lines.map((line) => enrichLine(line, menuItemMap, ingDefMap, optionMap)),
  }));
}

function resolveWeightGr(c: any): number | undefined {
  // If the ingredient has weightPerUnit, always compute from count × weightPerUnit
  // (this overrides any stale cached c.weightGr stored in the choice)
  if (c.count && c.ingredientDef?.weightPerUnit) {
    return Math.round(c.count * c.ingredientDef.weightPerUnit * 10) / 10;
  }
  if (c.weightGr) return c.weightGr;
  return undefined;
}

function enrichLine(
  line: { id: string; lineData: any },
  menuItemMap: Map<string, any>,
  ingDefMap: Map<string, any>,
  optionMap: Map<string, any>,
): EnrichedLine {
  const d = line.lineData as any;

  // Old snapshot format — return as-is
  if (!isNewFormat(d)) {
    return {
      id: line.id,
      type: d.type ?? 'item',
      displayName: d.displayName ?? '?',
      priceRon: d.priceRon ?? 0,
      totalPriceRon: d.totalPriceRon ?? d.priceRon ?? 0,
      variations: d.variations ?? [],
      kitchenItems: d.kitchenItems ?? [],
      extras: d.extras ?? [],
      rawData: undefined,
    };
  }

  const storedLine = d as StoredLine;
  const selOpts = (storedLine.selectedOptions ?? []).map((o) => ({
    ...o,
    option: optionMap.get(o.optionId) as any,
  }));

  const regularVariations = selOpts
    .filter((o) => o.option)
    .map((o) => ({
      setName: o.option.set.name as string,
      optionName: o.option.name as string,
      qty: o.qty > 1 ? o.qty : undefined,
      hideFromKitchen: (o.option.set.hideFromKitchen as boolean) ?? false,
    }));

  const extras: EnrichedLine['extras'] = (storedLine.extras ?? []).flatMap((e) => {
    const ing = ingDefMap.get(e.ingredientDefId);
    const eOpts = e.selectedOptions ?? [];
    const hideFromKitchen = ing?.hideFromKitchen ?? false;
    const typeName = (ing as any)?.type?.name as string | undefined;
    if (eOpts.length > 0) {
      return eOpts.map((o: any) => {
        const opt = optionMap.get(o.optionId) as any;
        return { name: ing?.name ?? '?', tag: opt?.name ?? '?', qty: o.qty > 1 ? o.qty : undefined, hideFromKitchen, typeName };
      });
    }
    return [{ name: ing?.name ?? '?', tag: undefined, qty: e.qty > 1 ? e.qty : undefined, hideFromKitchen, typeName }];
  });

  const extrasTotal = (storedLine.extras ?? []).reduce((s, e) => {
    const ing = ingDefMap.get(e.ingredientDefId);
    const qty = (e.selectedOptions ?? []).reduce((a: number, o: any) => a + o.qty, 0) || e.qty;
    return s + (ing?.priceRon ?? 0) * qty;
  }, 0);

  if (storedLine.type === 'custom') {
    const cis = storedLine.customIngredients ?? [];
    const kitchenItems: EnrichedLine['kitchenItems'] = cis.flatMap((ci) => {
      const ing = ingDefMap.get(ci.ingredientDefId);
      const typeName = (ing as any)?.type?.name as string | undefined;
      const unit = (ing as any)?.unitType?.name as string | undefined;
      const wpu = (ing as any)?.weightPerUnit as number | undefined;
      const ciOpts = selOpts.filter((o) => o.ingredientDefId === ci.ingredientDefId);
      if (ciOpts.length > 0) {
        return ciOpts.map((o) => {
          const weightGr = wpu ? Math.round(wpu * o.qty * 10) / 10 : undefined;
          return { name: ing?.name ?? '?', tag: o.option?.name, count: o.qty, weightGr, hideFromKitchen: ing?.hideFromKitchen ?? false, typeName, unit };
        });
      }
      const weightGr = wpu ? Math.round(wpu * ci.qty * 10) / 10 : undefined;
      return [{ name: ing?.name ?? '?', count: ci.qty, weightGr, hideFromKitchen: ing?.hideFromKitchen ?? false, typeName, unit }];
    });

    const basePrice = cis.reduce((s, ci) => {
      const ing = ingDefMap.get(ci.ingredientDefId);
      const ciOpts = selOpts.filter((o) => o.ingredientDefId === ci.ingredientDefId);
      const qty = ciOpts.length > 0 ? ciOpts.reduce((a, o) => a + o.qty, 0) : ci.qty;
      const optsDelta = ciOpts.reduce((a, o) => a + ((o.option?.priceDelta ?? 0) * o.qty), 0);
      return s + (ing?.priceRon ?? 0) * qty + optsDelta;
    }, 0);

    return {
      id: line.id,
      type: 'custom',
      displayName: 'Egyedi összeállítás',
      priceRon: basePrice,
      totalPriceRon: basePrice + extrasTotal,
      variations: [],
      kitchenItems,
      extras,
      rawData: storedLine,
    };
  }

  // Menu item
  const menuItem = menuItemMap.get(storedLine.menuItemId!);

  // OR-type ingredient choices: optionId = ingredientDefId, no variationOption in DB
  const orVariations: EnrichedLine['variations'] = [];
  for (const o of selOpts) {
    if (o.option) continue;
    const ingDef = ingDefMap.get(o.optionId);
    if (!ingDef) continue;
    const orGroup = menuItem?.ingredients
      .map((ing: any) => ing.choices.filter((c: any) => !c.variationOption && c.ingredientDef))
      .find((choices: any[]) => choices.length > 1 && choices.some((c: any) => c.ingredientDef?.id === o.optionId));
    if (orGroup) {
      orVariations.push({
        setName: (orGroup as any[]).map((c: any) => c.ingredientDef?.name ?? '?').join(' / '),
        optionName: ingDef.name,
        qty: undefined,
        hideFromKitchen: false,
      });
    }
  }

  const variations = [...regularVariations, ...orVariations];

  const kitchenItems: EnrichedLine['kitchenItems'] = (menuItem?.ingredients ?? []).flatMap((ing: any) => {
    const orChoices = ing.choices.filter((c: any) => !c.variationOption && c.ingredientDefId);
    const isOrGroup = orChoices.length > 1;

    let choicesToRender = ing.choices;
    if (isOrGroup) {
      const orSetId = `OR_${ing.id}`;
      const orIngIds = new Set(orChoices.map((c: any) => c.ingredientDefId as string));
      const selectedOrOptId =
        selOpts.find((o) => o.variationSetId === orSetId)?.optionId ??
        selOpts.find((o) => o.variationSetId.startsWith('OR_') && orIngIds.has(o.optionId))?.optionId;
      if (selectedOrOptId) {
        choicesToRender = ing.choices.filter((c: any) => c.ingredientDef?.id === selectedOrOptId);
      } else {
        choicesToRender = [];
      }
    }

    return choicesToRender
      .filter((c: any) => isOrGroup || c.weightGr || c.count || c.ingredientDef?.weightPerUnit)
      .flatMap((c: any) => {
        const name = c.ingredientDef?.name ?? '?';
        const ingDef = ingDefMap.get(c.ingredientDefId);
        const hideFromKitchen = ingDef?.hideFromKitchen ?? false;
        const typeName = (c.ingredientDef as any)?.type?.name as string | undefined;
        const unit = (c.ingredientDef as any)?.unitType?.name as string | undefined;
        if (c.variationOption?.name) {
          const matchedOpt = selOpts.find((o) => o.option?.id === c.variationOption.id);
          const isSelected = !!matchedOpt;
          const otherOptionSelected = selOpts.some(
            (o) => o.variationSetId === c.variationOption.setId && o.option && o.option.id !== c.variationOption.id,
          );
          if (!isSelected && otherOptionSelected) return [];
          const actualQty = matchedOpt?.qty ?? c.count;
          const totalSelectedQtyForSet = selOpts
            .filter((o) => o.variationSetId === c.variationOption.setId)
            .reduce((sum, o) => sum + o.qty, 0);
          let weightGr: number | undefined;
          if (c.weightGr && totalSelectedQtyForSet > 0) {
            // c.weightGr = full slot weight; prorate by how many of this variant were selected
            weightGr = Math.round((actualQty / totalSelectedQtyForSet) * c.weightGr * 10) / 10 || undefined;
          } else if (c.ingredientDef?.weightPerUnit) {
            weightGr = Math.round(actualQty * c.ingredientDef.weightPerUnit * 10) / 10 || undefined;
          } else {
            weightGr = c.weightGr ?? undefined;
          }
          return [{ name, tag: c.variationOption.name as string, weightGr, count: actualQty || undefined, hideFromKitchen, representedInVariations: true, typeName, unit }];
        }
        if (c.ingredientDefId) {
          const matched = selOpts.filter((o) => o.ingredientDefId === c.ingredientDefId && o.option);
          if (matched.length > 0) {
            const totalSelectedQty = matched.reduce((sum, o) => sum + o.qty, 0);
            return matched.map((o) => {
              let weightGr: number | undefined;
              if (c.weightGr && totalSelectedQty > 0) {
                weightGr = Math.round((o.qty / totalSelectedQty) * c.weightGr * 10) / 10 || undefined;
              } else if (o.qty && c.ingredientDef?.weightPerUnit) {
                weightGr = Math.round(o.qty * c.ingredientDef.weightPerUnit * 10) / 10;
              } else {
                weightGr = resolveWeightGr(c);
              }
              return {
                name,
                tag: o.option.name as string,
                weightGr,
                count: o.qty || undefined,
                hideFromKitchen,
                representedInVariations: true,
                typeName,
                unit,
              };
            });
          }
        }
        return [{ name, tag: undefined, weightGr: resolveWeightGr(c), count: c.count || undefined, hideFromKitchen, representedInVariations: isOrGroup, typeName, unit }];
      });
  });

  // Item-level variation sets (ingredientDefId: null) with hideFromKitchen: false
  // are not in kitchenItems via ingredient choices, so we append them here for the list.
  for (const o of selOpts) {
    if (!o.option) continue;
    if (o.option.set.ingredientDefId !== null) continue;
    if (o.option.set.hideFromKitchen) continue;
    kitchenItems.push({ name: o.option.set.name as string, tag: o.option.name as string, hideFromKitchen: false, representedInVariations: false });
  }

  const variationsDelta = selOpts.reduce((s, o) => s + ((o.option?.priceDelta ?? 0) * (o.qty ?? 1)), 0);

  return {
    id: line.id,
    type: 'item',
    displayName: menuItem?.name ?? '?',
    priceRon: menuItem?.priceRon ?? 0,
    totalPriceRon: (menuItem?.priceRon ?? 0) + extrasTotal + variationsDelta,
    variations,
    kitchenItems,
    extras,
    rawData: storedLine,
  };
}

export const orderService = {
  async create(type: 'CARD' | 'PACK' | 'CASH' | 'CASH_PACK', totalRon: number, lines: StoredLine[], note?: string) {
    const date = todayStr();
    const orderNumber = await generateOrderNumber(date);
    const order = await prisma.order.create({
      data: {
        orderNumber, date, type, totalRon, note: note || null,
        lines: { create: lines.map((lineData) => ({ lineData: lineData as any })) },
      },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    });
    bumpVersion();
    const enriched = await enrichOrders([order as any]);
    return enriched[0];
  },

  async listActive(date?: string) {
    const orders = await prisma.order.findMany({
      where: { date: date ?? todayStr() },
      orderBy: { createdAt: 'asc' },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    });
    return enrichOrders(orders);
  },

  async listToday() {
    const orders = await prisma.order.findMany({
      where: { date: todayStr() },
      orderBy: { createdAt: 'desc' },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    });
    return enrichOrders(orders);
  },

  async update(id: string, payload: { type?: string; totalRon?: number; lines?: any[]; note?: string | null }) {
    await prisma.$transaction(async (tx) => {
      if (payload.lines) {
        await tx.orderLine.deleteMany({ where: { orderId: id } });
      }
      const data: any = {};
      if (payload.type != null) data.type = payload.type;
      if (payload.totalRon != null) data.totalRon = payload.totalRon;
      if (payload.note !== undefined) data.note = payload.note || null;
      if (payload.lines) {
        data.lines = { create: payload.lines.map((ld: any) => ({ lineData: ld as any })) };
      }
      await tx.order.update({ where: { id }, data });
    });
    bumpVersion();
    const order = await prisma.order.findFirstOrThrow({
      where: { id },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    });
    const enriched = await enrichOrders([order as any]);
    return enriched[0];
  },

  async getStats(date?: string) {
    const orders = await this.listActive(date);

    const totalRon = orders.reduce((s, o) => s + o.totalRon, 0);
    const cardRon = orders.filter((o) => o.type === 'CARD' || o.type === 'PACK').reduce((s, o) => s + o.totalRon, 0);
    const cashRon = orders.filter((o) => o.type === 'CASH' || o.type === 'CASH_PACK').reduce((s, o) => s + o.totalRon, 0);
    const packCount = orders
      .filter((o) => o.type === 'PACK' || o.type === 'CASH_PACK')
      .reduce((s, o) => s + o.lines.length, 0);
    const lineCount = orders.reduce((s, o) => s + o.lines.length, 0);

    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const itemMap = new Map<string, { count: number; totalRon: number }>();
    for (const o of orders) {
      for (const l of o.lines) {
        const v = itemMap.get(l.displayName) ?? { count: 0, totalRon: 0 };
        itemMap.set(l.displayName, { count: v.count + 1, totalRon: v.totalRon + l.totalPriceRon });
      }
    }
    const topItems = [...itemMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const ingMap = new Map<string, { typeName?: string; unit?: string; count: number; weightGr: number }>();
    const addIng = (item: any) => {
      const key = item.name + (item.tag ? `__${item.tag}` : '');
      const label = item.name + (item.tag ? ` (${item.tag})` : '');
      const cnt = item.count ?? item.qty ?? 1;
      const wgr = item.weightGr ?? 0;
      const existing = ingMap.get(key) ?? { typeName: item.typeName, unit: item.unit, count: 0, weightGr: 0, label };
      ingMap.set(key, { ...existing, typeName: item.typeName ?? existing.typeName, unit: item.unit ?? existing.unit, count: existing.count + cnt, weightGr: Math.round((existing.weightGr + wgr) * 10) / 10 });
    };
    for (const o of orders) {
      for (const l of o.lines) {
        for (const ki of l.kitchenItems) addIng(ki);
        for (const ex of l.extras) addIng(ex);
      }
    }
    const ingredients = [...ingMap.entries()]
      .map(([, v]) => v)
      .sort((a, b) => {
        const ta = (a as any).typeName ?? '';
        const tb = (b as any).typeName ?? '';
        if (ta !== tb) return ta.localeCompare(tb);
        return (a as any).label.localeCompare((b as any).label);
      })
      .map((v: any) => ({ name: v.label, typeName: v.typeName, unit: v.unit, count: v.count, weightGr: v.weightGr }));

    return {
      date: date ?? todayStr(),
      orderCount: orders.length,
      lineCount,
      totalRon: Math.round(totalRon * 100) / 100,
      cardRon: Math.round(cardRon * 100) / 100,
      cashRon: Math.round(cashRon * 100) / 100,
      packCount,
      avgOrderRon: orders.length > 0 ? Math.round(totalRon / orders.length * 100) / 100 : 0,
      statusBreakdown,
      topItems,
      ingredients,
    };
  },

  async remove(id: string) {
    await prisma.order.delete({ where: { id } });
    bumpVersion();
  },

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id }, data: { status },
      include: { lines: { orderBy: { createdAt: 'asc' } } },
    });
    bumpVersion();
    const enriched = await enrichOrders([order]);
    return enriched[0];
  },
};
