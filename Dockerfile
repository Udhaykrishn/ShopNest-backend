FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Explicitly copy pdfkit font files to ensure availability
COPY node_modules/pdfkit/js/data/Helvetica*.afm ./data/

COPY . .
COPY .env .env

ENV NODE_ENV=production

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Create directory for font files
RUN mkdir -p /app/dist/data

# Copy font files from build stage
COPY --from=build /app/data/Helvetica*.afm /app/dist/data/

# Install system fonts (optional, for fallback)
RUN apk update && apk add --no-cache \
    fontconfig \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env ./
COPY --from=build /app/dist/*.map ./dist

RUN npm install --omit=dev

EXPOSE 3001

CMD ["npm", "start"]