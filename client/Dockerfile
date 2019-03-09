FROM node:alpine as builder
WORKDIR "/app"
COPY ./package.json ./
RUN yarn
COPY . .
RUN yarn build

FROM nginx
EXPOSE 8080
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
