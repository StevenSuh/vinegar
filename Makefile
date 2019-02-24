dev:
	cd client && yarn serve >/dev/null & cd server && yarn serve >/dev/null
install:
	cd client && yarn && cd ../server && yarn
prettier:
	prettier --write **/*.js **/*.vue
lint:
	make prettier && cd client && yarn lint --fix && cd ../server && yarn lint --fix
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
serve-no-cache:
	make delete-client && make delete-api && make delete-interval && docker-compose build --no-cache && make serve
serve-reset:
	docker system prune && docker-compose down && docker-compose rm && docker-compose pull && docker-compose up --build
reset-redis:
	docker exec -it $(shell docker ps -qf "name=redis") redis-cli FLUSHALL
delete-psql:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres -c "DROP DATABASE vinegar"
create-psql:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres -c "CREATE DATABASE vinegar"
create-user:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres -c "CREATE USER random WITH CREATEDB LOGIN PASSWORD 'somepw'"
reset-psql:
	make delete-psql && make create-psql
reset-db:
	make reset-redis && make reset-psql
