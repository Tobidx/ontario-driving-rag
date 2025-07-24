FROM node:18-alpine

# Install minimal system packages
RUN apk add --no-cache curl

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs
EXPOSE 3001

CMD ["node", "dist/server.js"]