FROM node:12

ENV PORT 3000
ENV CONNECT_TO 127.0.0.1:3000
ENV NAME bob
ENV DEBUG false

WORKDIR /game

COPY package*.json ./
RUN npm i

COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]
