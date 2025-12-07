# Use Node.js LTS as base image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Use a lightweight server to serve the static build
RUN npm install -g serve

# Expose port (will be overridden by Railway)
EXPOSE 3000

# Start the server - use PORT env var if set, default to 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
