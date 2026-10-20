# ──────────────────────────────────────────────
# WCE Virtual Lab — Frontend Production Dockerfile
# ──────────────────────────────────────────────
# Multi-stage build: Vite compilation + Nginx Alpine
# ──────────────────────────────────────────────

# Stage 1: Build the Vite React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API URL build argument (defaults to /api if proxied, or full backend URL)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies with clean install
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with Lightweight Nginx Alpine
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built production distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
