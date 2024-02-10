FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --update python3 make g++\
  && rm -rf /var/cache/apk/*\
  && corepack enable
WORKDIR /workspace

FROM base AS prod-deps
COPY ["../../../pnpm-lock.yaml", "./package.json", "./"]
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
# Disable NX daemon to avoid issues with docker builds
# See https://github.com/nrwl/nx/issues/12200
ENV NX_DAEMON false
COPY ["../../../pnpm-lock.yaml", "../../../package.json", "./"]
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY ../../../ .
RUN npx nx build monitor-api --prod

FROM node:18-alpine AS app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
WORKDIR /app
COPY --from=prod-deps /workspace/node_modules ./node_modules
COPY --from=build /workspace/dist/apps/monitor-api .
CMD ["node", "main.js"]
