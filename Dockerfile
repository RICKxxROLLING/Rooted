# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
# API keys are baked into the client bundle at build time
ARG VITE_PLANTNET_KEY
ARG VITE_PERENUAL_KEY
ENV VITE_PLANTNET_KEY=$VITE_PLANTNET_KEY \
    VITE_PERENUAL_KEY=$VITE_PERENUAL_KEY
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine
LABEL org.opencontainers.image.title="Garden Tracker" \
      org.opencontainers.image.description="Track, water and plan your garden" \
      org.opencontainers.image.source="https://github.com/RICKxxROLLING/Rooted" \
      org.opencontainers.image.licenses="AGPL-3.0" \
      net.unraid.docker.icon="https://raw.githubusercontent.com/RICKxxROLLING/Rooted/main/public/icon.png" \
      net.unraid.docker.webui="http://[IP]:[PORT:80]/"
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
