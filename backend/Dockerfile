# ──────────────────────────────────────────────
# WCE Virtual Lab — Backend Production Dockerfile
# ──────────────────────────────────────────────
# Multi-stage secure Node.js LTS environment
# ──────────────────────────────────────────────

FROM node:20-alpine AS base

# Install Docker CLI inside container for host daemon communication (via socket mount)
RUN apk add --no-cache docker-cli

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Ensure tmp execution directory exists with proper permissions
RUN mkdir -p /app/tmp && chmod 777 /app/tmp

# Expose backend port
EXPOSE 5000

# Environment defaults
ENV PORT=5000
ENV NODE_ENV=production

# Start Express server
CMD ["node", "server.js"]
