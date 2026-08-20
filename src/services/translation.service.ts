import { env } from '@/config/env';

function getEndpoint(key: string) {
  // Free keys end with :fx, pro keys use the other endpoint
  return key.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';
}

async function translate(texts: string[], targetLang: string): Promise<string[]> {
  if (!env.deeplApiKey || texts.length === 0) return texts.map(() => '');

  const body = new URLSearchParams();
  body.append('source_lang', 'HU');
  body.append('target_lang', targetLang);
  texts.forEach((t) => body.append('text', t));

  const res = await fetch(getEndpoint(env.deeplApiKey), {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${env.deeplApiKey}` },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`DeepL error: ${res.status} ${detail}`);
  }
  const json = (await res.json()) as { translations: { text: string }[] };
  return json.translations.map((t) => t.text);
}

export async function translateName(name: string): Promise<{ nameEn: string; nameRo: string }> {
  if (!env.deeplApiKey) return { nameEn: '', nameRo: '' };
  try {
    const [enResults, roResults] = await Promise.all([
      translate([name], 'EN-GB'),
      translate([name], 'RO'),
    ]);
    return { nameEn: enResults[0] ?? '', nameRo: roResults[0] ?? '' };
  } catch (err) {
    console.error('Translation failed:', err);
    return { nameEn: '', nameRo: '' };
  }
}

/** Translate multiple names in a single API call */
export async function translateNames(names: string[]): Promise<{ nameEn: string; nameRo: string }[]> {
  if (!env.deeplApiKey || names.length === 0) return names.map(() => ({ nameEn: '', nameRo: '' }));
  try {
    const [enResults, roResults] = await Promise.all([
      translate(names, 'EN-GB'),
      translate(names, 'RO'),
    ]);
    return names.map((_, i) => ({ nameEn: enResults[i] ?? '', nameRo: roResults[i] ?? '' }));
  } catch (err) {
    console.error('Batch translation failed:', err);
    return names.map(() => ({ nameEn: '', nameRo: '' }));
  }
}

export const translateMenuItem = translateName;
