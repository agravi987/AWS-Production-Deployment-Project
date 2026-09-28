# ==============================================================================
# Multi-Stage Dockerfile for React Frontend
# Stage 1: Build the React Application (Node.js)
# Stage 2: Serve using Nginx (Ultra-lightweight production server)
# ==============================================================================

# ----------------- STAGE 1: Build Stage -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first for caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy client source code
COPY . .

# Build the production bundle into the /app/dist directory
RUN npm run build

# ----------------- STAGE 2: Production Stage -----------------
FROM nginx:alpine

# Remove default Nginx welcome website
RUN rm -rf /usr/share/nginx/html/*

# Copy built static assets from Stage 1 into Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration (reverse proxy + SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
