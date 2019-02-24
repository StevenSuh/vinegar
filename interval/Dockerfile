FROM node:alpine
WORKDIR "/app"
COPY ./package.json ./
RUN yarn
COPY . .
RUN yarn add global forever
CMD ["forever", "start", "-c", "'yarn start'", "./"]
