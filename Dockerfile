FROM node:20

WORKDIR /server

COPY dist/* ./dist/
COPY dist/classes/* ./dist/classes/
COPY dist/constants/* ./dist/constants/
COPY dist/jsonschemas/* ./dist/jsonschemas/
COPY dist/models/* ./dist/models/
COPY dist/types/* ./dist/types/
COPY package*.json ./

EXPOSE 8081

RUN npm install

ENTRYPOINT [ "node", "/server/dist/index.js" ]
