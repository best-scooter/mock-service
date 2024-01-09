FROM node:20

WORKDIR /server

COPY dist/* ./dist/
COPY dist/assets/* ./dist/assets/
COPY dist/classes/* ./dist/classes/
COPY dist/constants/* ./dist/constants/
COPY dist/customerSystem/* ./dist/customerSystem/
COPY dist/hardwareMock/* ./dist/hardwareMock/
COPY dist/hardwareMock/controller/* ./dist/hardwareMock/controller/
COPY dist/hardwareMock/model/* ./dist/hardwareMock/model/
COPY dist/hardwareMock/model/types/* ./dist/hardwareMock/model/types
COPY dist/jsonschemas/* ./dist/jsonschemas/
COPY dist/models/* ./dist/models/
COPY dist/types/* ./dist/types/
COPY dist/utils/* ./dist/utils/
COPY package*.json ./

EXPOSE 8082

RUN npm install

ENTRYPOINT [ "node", "/server/dist/index.js" ]
