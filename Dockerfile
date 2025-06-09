FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY .env .env

ENV NODE_ENV=production

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env ./ 
COPY --from=build /app/dist/*.map ./dist

RUN npm install --omit=dev

EXPOSE 3001

CMD ["npm", "start"]
