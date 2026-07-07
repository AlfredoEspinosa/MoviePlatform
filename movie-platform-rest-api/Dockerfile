FROM node:22-alpine

RUN apk update && apk add postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000/tcp

ENTRYPOINT ["./docker-entrypoint.sh"]
