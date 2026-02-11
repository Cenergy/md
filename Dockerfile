FROM m.daocloud.io/docker.io/library/node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build tasks)
RUN npm install

# Copy source code
COPY . .

# Skip build on server to save memory/time
# Ensure you run 'npm run build' locally before deploying
# RUN export NODE_OPTIONS="--max-old-space-size=6144" && npm run build

# Generate Prisma Client
RUN npx prisma generate

# Expose the port
EXPOSE 3001

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
# Run migrations before starting
CMD npx prisma migrate deploy && node server/index.js
