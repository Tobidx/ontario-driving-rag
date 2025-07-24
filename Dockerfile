FROM node:18-alpine

# Install Python and required system packages for building
RUN apk add --no-cache python3 py3-pip curl build-base python3-dev

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Build the application
RUN npm run build

# Copy and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs
EXPOSE 3001

CMD ["node", "dist/server.js"]