# Multi-stage build for Cafe Website (Next.js 15)
# NEXT_PUBLIC_* must be set at build time so production bundle uses correct API URLs.
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build-time args: production service base URLs (see devops-k8s apps/cafe-website/values.yaml)
ARG NEXT_PUBLIC_AUTH_SERVICE_URL=https://sso.codevertexitsolutions.com
ARG NEXT_PUBLIC_AUTH_UI_URL=https://accounts.codevertexitsolutions.com
ARG NEXT_PUBLIC_ORDERING_SERVICE_URL=https://orderapi.codevertexitsolutions.com
ARG NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL=https://notificationsapi.codevertexitsolutions.com
ARG NEXT_PUBLIC_LOGISTICS_SERVICE_URL=https://logisticsapi.codevertexitsolutions.com
ARG NEXT_PUBLIC_TREASURY_SERVICE_URL=https://booksapi.codevertexitsolutions.com
ARG NEXT_PUBLIC_INVENTORY_SERVICE_URL=https://inventoryapi.codevertexitsolutions.com
ARG NEXT_PUBLIC_SITE_URL=https://theurbanloftcafe.com
ARG NEXT_PUBLIC_APP_URL=https://theurbanloftcafe.com
ARG NEXT_PUBLIC_TENANT_SLUG=urban-loft
ARG NEXT_PUBLIC_TENANT_ID=tenant-urban-loft
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL \
    NEXT_PUBLIC_AUTH_UI_URL=$NEXT_PUBLIC_AUTH_UI_URL \
    NEXT_PUBLIC_ORDERING_SERVICE_URL=$NEXT_PUBLIC_ORDERING_SERVICE_URL \
    NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL=$NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL \
    NEXT_PUBLIC_LOGISTICS_SERVICE_URL=$NEXT_PUBLIC_LOGISTICS_SERVICE_URL \
    NEXT_PUBLIC_TREASURY_SERVICE_URL=$NEXT_PUBLIC_TREASURY_SERVICE_URL \
    NEXT_PUBLIC_INVENTORY_SERVICE_URL=$NEXT_PUBLIC_INVENTORY_SERVICE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_TENANT_SLUG=$NEXT_PUBLIC_TENANT_SLUG \
    NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID

# Build Next.js app (bakes NEXT_PUBLIC_* into bundle)
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm in production image
RUN npm install -g pnpm

# Copy from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app/.next

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["pnpm", "start"]
