# ==============================================================================
# Backend Dockerfile for Express.js API
# Purpose: Builds a secure, lightweight, production-ready container image
# ==============================================================================

# Step 1: Use official Node.js lightweight Alpine image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package files first
# Docker caches this layer! If package.json doesn't change, 'npm install' is skipped
COPY package*.json ./

# Step 4: Install production dependencies
RUN npm install --omit=dev

# Step 5: Copy the application source code into the container
COPY src/ ./src/

# Step 6: Security Best Practice: Run as non-root user (provided by node alpine)
USER node

# Step 7: Inform Docker that container listens on port 5000
EXPOSE 5000

# Step 8: Define the command to run the application
CMD ["node", "src/server.js"]
