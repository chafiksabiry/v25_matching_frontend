FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL_GIGS=https://preprod-api-gigsmanual.harx.ai/api
ENV VITE_API_URL=https://preprod-api-matching.harx.ai/api
ENV VITE_MATCHING_API_URL=https://preprod-api-matching.harx.ai/api
ENV VITE_QIANKUN=true
ENV VITE_IS_QIANKUN=true
ENV VITE_COMPANY_API_URL=https://preprod-api-companysearchwizard.harx.ai/api


RUN npm run build

RUN npm install -g serve

EXPOSE 5181

CMD ["serve", "-s", "dist", "-l", "5181"]
