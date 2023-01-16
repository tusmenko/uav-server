FROM alpine:3.16
ENV NODE_VERSION 16.19.0
RUN apk add --update nodejs npm yarn
WORKDIR /app
ENV PORT=3000
COPY package.json yarn.lock /app/
RUN yarn install
COPY . /app
EXPOSE $PORT
CMD yarn start:prod