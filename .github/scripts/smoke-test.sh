#!/usr/bin/env bash
# Starts the built image (with no API keys, like a fresh install) and checks
# that nginx is healthy and the web protections are in place.
# (no pipefail: `curl | grep -q` would otherwise report a spurious failure when grep exits early)
set -eu

IMAGE="$1"
URL="http://localhost:8080"
FAILED=0

docker run -d --name gt-smoke -p 8080:80 "$IMAGE" >/dev/null
trap 'docker logs gt-smoke; docker rm -f gt-smoke >/dev/null' EXIT

for _ in $(seq 1 20); do curl -s -o /dev/null "$URL/" && break; sleep 0.5; done

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; FAILED=1; }
status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
header() { curl -s -D - -o /dev/null "$1" | tr -d '\r' | grep -i "^$2:" || true; }

docker exec gt-smoke nginx -t && pass "nginx config valid" || fail "nginx config invalid"

[ "$(status "$URL/")" = 200 ] && pass "app loads" || fail "app does not load"
[ "$(status "$URL/some/deep/link")" = 200 ] && pass "SPA fallback" || fail "SPA fallback"

for h in Content-Security-Policy X-Content-Type-Options X-Frame-Options Referrer-Policy Permissions-Policy Strict-Transport-Security; do
  [ -n "$(header "$URL/" "$h")" ] && pass "header $h" || fail "missing header $h"
done
header "$URL/" Server | grep -q '[0-9]' && fail "nginx version exposed" || pass "nginx version hidden"

ASSET=$(curl -s "$URL/" | grep -o '/assets/[^"]*\.js' | head -1)
header "$URL$ASSET" Cache-Control | grep -q immutable && pass "assets cached" || fail "assets not cached"
[ -n "$(header "$URL$ASSET" Content-Security-Policy)" ] && pass "assets keep security headers" || fail "assets missing security headers"
header "$URL/index.html" Cache-Control | grep -q no-cache && pass "index.html revalidates" || fail "index.html cached"

[ "$(status -X POST "$URL/")" = 403 ] && pass "POST to site blocked" || fail "POST to site allowed"
[ "$(status "$URL/.env")" = 403 ] && pass "dotfiles blocked" || fail "dotfiles served"
[ "$(status "$URL/api/nope")" = 404 ] && pass "unknown API path 404" || fail "unknown API path served"
[ "$(status -X POST "$URL/api/perenual/species-list")" = 403 ] && pass "Perenual proxy is read-only" || fail "Perenual proxy accepts POST"

# Proxies reach their upstreams over verified TLS (502 would mean a proxy/TLS problem)
curl -s "$URL/api/upc/lookup?upc=1" | grep -q INVALID_UPC && pass "UPC proxy reaches upstream" || fail "UPC proxy broken"
code=$(status "$URL/api/perenual/species-list?q=tomato")
[ "$code" != 502 ] && [ "$code" != 404 ] && pass "Perenual proxy reaches upstream ($code without key)" || fail "Perenual proxy broken ($code)"
code=$(status -X POST "$URL/api/plantnet/identify")
[ "$code" != 502 ] && [ "$code" != 404 ] && pass "Pl@ntNet proxy reaches upstream ($code without key)" || fail "Pl@ntNet proxy broken ($code)"

# Rate limit kicks in on a burst (20/min + burst 10)
limited=0
for _ in $(seq 1 15); do [ "$(status "$URL/api/perenual/species-list?q=x")" = 429 ] && limited=1; done
[ "$limited" = 1 ] && pass "API rate limit active" || fail "API rate limit not triggered"

exit $FAILED
