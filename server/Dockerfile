FROM node:alpine
WORKDIR "/app"
RUN mkdir shared
COPY ./shared ./shared
RUN mkdir server

WORKDIR "/app/server"
COPY ./server/package.json ./
RUN yarn
COPY ./server .
RUN yarn add global forever
CMD ["forever", "start", "-c", "'yarn start'", "./"]
