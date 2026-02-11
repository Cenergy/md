FROM m.daocloud.io/docker.io/library/node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build tasks)
RUN npm install

# Copy source code
COPY . .

# No build step required - using Vite middleware
# RUN export NODE_OPTIONS="--max-old-space-size=4096" && npm run build

# Generate Prisma Client
RUN npx prisma generate

# Expose the port
EXPOSE 3001

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
# Run migrations before starting
# Ensure we use the correct schema location defined in package.json
CMD npx prisma db push --schema=server/data/schema.prisma && node server/index.js
