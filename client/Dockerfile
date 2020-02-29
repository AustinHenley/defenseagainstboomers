FROM node:alpine
WORKDIR "/app/client"
COPY ./package.json ./
RUN npm install
COPY . .
CMD ["node", "app.js"]