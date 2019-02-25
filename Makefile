dev:
	cd client && yarn serve >/dev/null & cd server && yarn serve >/dev/null
install:
	cd client && yarn && cd ../server && yarn
prettier:
	prettier --write **/*.js **/*.vue
lint:
	make prettier && cd client && yarn lint --fix && cd ../server && yarn lint --fix && cd ../interval && yarn lint --fix
serve:
	docker-compose up
serve-build:
	docker-compose up --build
delete-client:
	docker rm $(shell docker ps -aqf "name=client")
delete-api:
	docker rm $(shell docker ps -aqf "name=api")
delete-interval:
	docker rm $(shell docker ps -aqf "name=interval")
clear-node-modules:
	cd client && rm -rf node_modules && cd ../server && rm -rf node_modules && cd ../interval && rm -rf node_modules
serve-no-cache:
	make delete-client && make delete-api && make delete-interval && docker-compose build --no-cache && make serve
serve-reset:
	docker system prune && docker-compose down && docker-compose rm && docker-compose pull && docker-compose up --build
reset-redis:
	docker exec -it $(shell docker ps -qf "name=redis") redis-cli FLUSHALL
sh-redis:
	docker exec -it $(shell docker ps -qf "name=redis") redis-cli
delete-psql:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres -c "DROP DATABASE postgres; CREATE DATABASE postgres;"
sh-psql:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres
reset-psql:
	make delete-psql
reset-db:
	make reset-redis && make reset-psql
