FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy everything else
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app explicitly
RUN npm run build

# Give execution permission to the script
RUN chmod +x docker-entrypoint.sh

# Add a "check" to see if dist/main.js actually exists
# RUN ls -la dist/

EXPOSE 3000

# Combined command
# CMD npx prisma db push && npx prisma db seed && node dist/src/main.js

# Use the script as the entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]