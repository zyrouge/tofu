FROM node:lts-alpine

WORKDIR /usr/app
ENV NODE_ENV=production

COPY LICENSE .
COPY README.md .
COPY package*.json .
COPY dist .

RUN npm ci

CMD [ "npm", "start" ]
