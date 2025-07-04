FROM node:18-alpine AS base

ARG RESEND_API_KEY
ARG MONGODB_URI
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV MONGODB_URI=$MONGODB_URI
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy only necessary files (excluding payment-service)
COPY next.config.js ./
COPY package.json ./
COPY public ./public
COPY src ./src
COPY lib ./lib
COPY styles ./styles
COPY tsconfig.json ./
COPY .eslintrc.json ./
# Create dummy payment-service directory to avoid build errors
RUN mkdir -p payment-service/src
RUN echo '// placeholder' > payment-service/src/index.ts

# Next.js collects anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ENV RESEND_API_KEY=your_api_key_here

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size 
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Add healthcheck to ensure the application is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "wget", "-q", "--spider", "http://localhost:3000/api/health" ]

CMD ["node", "server.js"]
