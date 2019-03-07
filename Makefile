deploy:
	make lint && make test && bash deploy.sh
test:
	echo "There are no tests at the moment"
dev:
	cd client && yarn serve >/dev/null & cd server && yarn serve >/dev/null
install:
	cd client && yarn && \
	cd ../server && yarn && \
	cd ../interval && yarn
prettier:
	prettier --write **/*.js **/*.vue
lint:
	make prettier && \
	cd client && yarn lint --fix && \
	cd ../server && yarn lint --fix && \
	cd ../interval && yarn lint --fix


serve:
	make reset-redis && docker-compose up
serve-build:
	docker-compose up --build
delete-client:
	docker rm $(shell docker ps -aqf "name=client")
delete-api:
	docker rm $(shell docker ps -aqf "name=api")
delete-interval:
	docker rm $(shell docker ps -aqf "name=interval")
clear-node-modules:
	cd client && rm -rf node_modules && \
	cd ../server && rm -rf node_modules && \
	cd ../interval && rm -rf node_modules
serve-no-cache:
	make delete-client && \
	make delete-api && \
	make delete-interval && \
	docker-compose build --no-cache && make serve
serve-reset:
	docker system prune && \
	docker-compose down && \
	docker-compose rm && \
	docker-compose pull && \
	docker-compose build --no-cache && \
	docker-compose up

update:
	docker exec -it $(shell docker ps -qf "name=client") sh -c 'rm -f yarn.lock && yarn' && \
	docker exec -it $(shell docker ps -qf "name=api") sh -c 'rm -f yarn.lock && yarn' && \
	docker exec -it $(shell docker ps -qf "name=interval") sh -c 'rm -f yarn.lock && yarn'
start-redis:
	docker container start $(shell docker ps -aqf "name=redis")
stop-redis:
	docker container stop $(shell docker ps -aqf "name=redis")
clear-redis:
	docker exec -it $(shell docker ps -qf "name=redis") redis-cli FLUSHALL
reset-redis:
	make start-redis && make clear-redis && make stop-redis
sh-redis:
	docker exec -it $(shell docker ps -qf "name=redis") redis-cli
clear-psql:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres -c "DROP DATABASE postgres; CREATE DATABASE postgres;"
sh-psql:
	docker exec -it $(shell docker ps -qf "name=postgres") psql -d postgres -U postgres
reset-db:
	make clear-redis && make clear-psql


setup-test:
	docker exec -it $(shell docker ps -qf "name=postgres") sh && \
	psql -d postgres -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'test_postgres'" || grep -q 1 || psql -d postgres -U postgres -c "CREATE DATABASE test_postgres"
