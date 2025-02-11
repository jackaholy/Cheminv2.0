# Use the official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json /app
RUN npm install

# Copy the rest of the frontend code
COPY . /app

# Expose the port
EXPOSE 3000

# Command to run the frontend
CMD ["npm", "start"]
