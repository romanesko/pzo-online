# Stage 1: Install development dependencies
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Install production dependencies
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 3: Build the application
FROM node:20-alpine AS build-env
WORKDIR /app
COPY . ./
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN npm run build

# Stage 4: Final image with Puppeteer and Chrome
FROM node:20-alpine

WORKDIR /app

# Install dependencies for Puppeteer and Chrome
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    bash

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy only necessary files
COPY package.json package-lock.json ./
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build

# Install Puppeteer and Chrome
RUN npm install puppeteer && \
    npx puppeteer browsers install chrome

CMD ["DEBUG=puppeteer:*", "npm", "run", "start"]
