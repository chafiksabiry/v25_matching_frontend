FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL_GIGS=https://v25gigsmanualcreationbackend-production.up.railway.app/api
ENV VITE_API_URL=https://v25matchingbackend-production.up.railway.app/api
ENV VITE_MATCHING_API_URL=https://v25matchingbackend-production.up.railway.app/api
ENV VITE_REP_CREATION_API_URL=/api
ENV VITE_QIANKUN=true
ENV VITE_IS_QIANKUN=true
ENV VITE_COMPANY_API_URL=https://v25searchcompanywizardbackend-production.up.railway.app/api


RUN npm run build

RUN npm install -g serve

EXPOSE 5181

CMD ["serve", "-s", "dist", "-l", "5181"]
