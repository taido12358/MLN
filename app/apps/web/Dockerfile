FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm install

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/web apps/web

ENV NEXT_TELEMETRY_DISABLED=1
# "" (not unset) tells the browser bundle to call same-origin (nginx) paths for both REST and
# socket.io instead of the http://localhost:3001 dev fallback — see apps/web/src/lib/{api,socket}.ts
# for why this must be an explicit empty string rather than an absent variable.
ENV NEXT_PUBLIC_API_URL=""

WORKDIR /repo/apps/web
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# `output: "standalone"` (apps/web/next.config.mjs) traces and copies only the node_modules this
# app actually needs (including @mln/shared, transpiled in via webpack) into standalone/ — no
# separate npm install required in the runtime image.
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["node", "server.js"]
