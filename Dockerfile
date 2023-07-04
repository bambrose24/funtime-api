FROM node:18-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install

RUN npx prisma generate


# Bundle app source
COPY . .

EXPOSE 8080

RUN npm run build

CMD [ "npm", "start" ]