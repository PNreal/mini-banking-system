FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Vite dev server (port 3001 theo cấu hình vite.config.ts)
EXPOSE 3001

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
