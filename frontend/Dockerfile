# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY frontend ./

# Build application
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Run application
CMD ["npm", "start"]
