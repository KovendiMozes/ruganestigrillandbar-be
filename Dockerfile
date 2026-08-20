FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN npx prisma generate
RUN pnpm run build

# ─── Runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
