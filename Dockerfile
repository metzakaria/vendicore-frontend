FROM node:22-slim

WORKDIR /app

# System deps
RUN apt-get update -y \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests first
COPY package.json package-lock.json ./

# Deterministic install
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client INSIDE container
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
