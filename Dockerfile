FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=https://api-matching.harx.ai/api
ENV VITE_API_URL_GIGS=https://api-gigsmanual.harx.ai/api
ENV VITE_QIANKUN=true
ENV VITE_IS_QIANKUN=true
ENV VITE_COMPANY_API_URL=https://api-companysearchwizard.harx.ai/api

ENV VITE_AWS_REGION=eu-west-3
ENV VITE_AWS_ACCESS_KEY_ID=AKIAWODTAOGLI4ZJPWA7
ENV VITE_AWS_SECRET_ACCESS_KEY=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
ENV VITE_AWS_SES_FROM_EMAIL=chafik.sabiry@harx.ai

RUN npm run build

RUN npm install -g serve

EXPOSE 5181

CMD ["serve", "-s", "dist", "-l", "5181"]
