# Use a lightweight official Node image to break the old cache layer
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies cleanly
RUN npm install

# Copy all project files (including your manual CORS server.js!)
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]