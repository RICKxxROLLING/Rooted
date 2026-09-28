# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine
LABEL org.opencontainers.image.title="Garden Tracker" \
      org.opencontainers.image.description="Track, water and plan your garden" \
      org.opencontainers.image.source="https://github.com/RICKxxROLLING/Rooted" \
      org.opencontainers.image.licenses="AGPL-3.0" \
      net.unraid.docker.icon="https://raw.githubusercontent.com/RICKxxROLLING/Rooted/main/public/icon.png" \
      net.unraid.docker.webui="http://[IP]:[PORT:80]/"

# API keys are supplied at runtime as container variables (e.g. in Unraid) and
# injected server-side by nginx — they are never part of the public web bundle.
# Empty defaults keep nginx starting if a key hasn't been set yet.
ENV PLANTNET_KEY="" \
    PERENUAL_KEY=""

COPY --from=builder /app/dist /usr/share/nginx/html
# The nginx image renders /etc/nginx/templates/*.template into conf.d at startup
COPY nginx/templates/ /etc/nginx/templates/
COPY nginx/snippets/ /etc/nginx/snippets/
RUN rm -f /etc/nginx/conf.d/default.conf
EXPOSE 80
