# ──────────────────────────────────────────────
# WCE Virtual Lab — Backend Production Dockerfile
# ──────────────────────────────────────────────
# Multi-stage secure Node.js LTS environment
# ──────────────────────────────────────────────

# Stage 1: Build Dependencies (with native compilation tools for bcrypt)
FROM node:20-alpine AS builder

WORKDIR /app

# Install native build tools required for bcrypt compilation on Alpine
RUN apk add --no-cache python3 make g++

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Create dedicated non-root application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled production node_modules from builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup . .

# Ensure isolated workspace tmp directory exists with write permissions for appuser
RUN mkdir -p /app/tmp && chown -R appuser:appgroup /app/tmp

# Drop root privileges
USER appuser

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
