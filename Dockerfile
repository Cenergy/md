FROM m.daocloud.io/docker.io/library/node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build tasks)
RUN npm install

# Copy source code
COPY . .

# Build frontend for production
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# Expose the port
EXPOSE 3001

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["node", "server/index.js"]
