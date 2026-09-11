FROM node:20-alpine

# Vietnamese content is read from bind-mounted volumes at runtime (see docker-compose.yml); this
# just makes sure Node's fs layer and any child process treat it as UTF-8 regardless of the image's
# default locale, since the base alpine image ships with no locale data at all otherwise.
ENV LANG=C.UTF-8

# Prisma's linux-musl query engine binary dynamically links against libssl at runtime; node:20-alpine
# ships no OpenSSL at all, so without this the api process crash-loops on every request with
# "Error loading shared library libssl.so.1.1: No such file or directory" (Prisma's own detection
# then silently guesses the wrong OpenSSL major version instead of erroring at build time).
RUN apk add --no-cache openssl

WORKDIR /repo

# Workspace-aware install: copy every package.json first (root + all workspaces actually used by
# the api at runtime: db, shared, api itself) so `npm install` resolves the workspace symlinks
# correctly, before copying source (better layer caching too).
COPY package.json ./
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install

COPY tsconfig.base.json ./
COPY packages/db packages/db
COPY packages/shared packages/shared
COPY apps/api apps/api

# Prisma Client is generated into packages/db/node_modules/.prisma by default (schema lives there);
# apps/api resolves @prisma/client through the workspace hoist, so generating once here covers it.
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

WORKDIR /repo/apps/api

# Run straight off TS source via tsx instead of `tsc build` + `node dist`: @mln/shared has no build
# step of its own (its package.json "main" points at its .ts source, meant to be consumed by a
# TS-aware loader), so a plain `node dist/index.js` would fail to import it. tsx is already the
# runtime every dev/test run in this project has used successfully, so this keeps behavior
# consistent between dev and the container instead of introducing a second, untested code path.
CMD ["npx", "tsx", "src/index.ts"]
