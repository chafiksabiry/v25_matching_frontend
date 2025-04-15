FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=https://preprod-api-matching.harx.ai/api


RUN npm run build

RUN npm install -g serve

EXPOSE 5181

CMD ["serve", "-s", "dist", "-l", "5181"]
