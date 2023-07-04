FROM node:16-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install && npm run build


# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]