FROM node:16-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install && npx prisma generate


# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]