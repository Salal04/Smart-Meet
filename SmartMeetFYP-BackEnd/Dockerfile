FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 4000

CMD ["npm", "run", "start"]