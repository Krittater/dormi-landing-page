# ── Build ──
FROM node:22-alpine AS build
WORKDIR /app

# NEXT_PUBLIC_* ถูก bake ตอน build — ส่งผ่าน build-arg (root compose ตั้งให้)
# ไม่ส่ง = ใช้ default ใน code (localhost) หรือค่าจาก .env.production ใน context
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DORMI_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_DORMI_API_URL=${NEXT_PUBLIC_DORMI_API_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime: standalone Node server (next.config: output 'standalone') ──
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
