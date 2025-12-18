FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# React dev server
EXPOSE 3000

CMD ["npm", "start"]


