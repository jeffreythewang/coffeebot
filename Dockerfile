FROM node:argon

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY coffeebot.js /usr/src/app/
COPY package.json /usr/src/app/
COPY .env /usr/src/app/
RUN npm install

CMD ["node", "coffeebot"]
