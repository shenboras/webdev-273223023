FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN apk add --no-cache python3 make g++ && npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["npm", "start"]