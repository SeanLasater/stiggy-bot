# Use a slim Node.js image (Node 20 is current LTS as of 2025)
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code (including built dist if you pre-build, but we'll build inside)
COPY . .

# Build the TypeScript (if needed)
RUN npm run build

# Run the bot
CMD ["node", "dist/index.js"]