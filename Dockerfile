# syntax=docker/dockerfile:1

# node:22-bullseye (glibc 2.31): compatibile anche con Docker Engine < 20.10.10,
# dove le immagini bookworm (glibc >= 2.34) falliscono per il profilo seccomp datato.
FROM node:22-bullseye-slim AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates g++ make python3 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-bullseye-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=deps /app/src/generated ./src/generated
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:./data/production.db

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

RUN mkdir -p /app/data/uploads \
  && chmod +x /app/scripts/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
