FROM node:alpine
WORKDIR "/app"
RUN mkdir shared
COPY ./shared ./shared
RUN mkdir interval

WORKDIR "/app/interval"
COPY ./interval/package.json ./
RUN yarn
COPY ./interval .
RUN yarn add global forever
CMD ["forever", "start", "-c", "'yarn start'", "./"]
