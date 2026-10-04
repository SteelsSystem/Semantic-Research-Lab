# Multi-stage production build for Multimodal Cognitive Interface on Google Cloud Run
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and build client
COPY . .
RUN npm run build

# Production runtime stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm install -g tsx

# Copy built frontend assets and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/types ./src/types

# Expose standard Cloud Run port
EXPOSE 8080

# Run full-stack TypeScript server with WebSocket support
CMD ["tsx", "server.ts"]
