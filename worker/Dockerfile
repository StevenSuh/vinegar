FROM node:alpine
WORKDIR "/app"
RUN mkdir shared
COPY ./shared ./shared
RUN mkdir worker

WORKDIR "/app/worker"
COPY ./worker/package.json ./
RUN yarn
COPY ./worker .
RUN yarn add global forever
CMD ["forever", "start", "-c", "'yarn start'", "./"]
