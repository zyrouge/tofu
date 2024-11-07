FROM node:lts-alpine AS builder

WORKDIR /usr/app

COPY package*.json .
COPY tsconfig.json .
COPY src src
COPY scripts scripts

RUN npm ci
RUN npm run build

FROM node:lts-alpine

WORKDIR /usr/app
ENV NODE_ENV production

COPY LICENSE .
COPY README.md .
COPY package*.json .
COPY --from=builder /usr/app/dist dist

RUN npm ci

CMD [ "npm", "start" ]
