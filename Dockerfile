FROM node:16-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install && npm build


# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]