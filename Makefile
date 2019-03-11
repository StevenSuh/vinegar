test:
	echo "There are no tests at the moment"
dev:
	cd client && yarn serve >/dev/null & cd server && yarn serve >/dev/null
install:
	cd client && yarn & \
	cd ../server && yarn & \
	cd ../interval && yarn & \
	cd ../worker && yarn
prettier:
	prettier --write **/*.js **/*.vue
lint:
	make prettier && \
	cd client && yarn lint --fix && \
	cd ../server && yarn lint --fix && \
	cd ../interval && yarn lint --fix && \
	cd ../worker && yarn lint --fix
lint-no-fix:
	cd client && yarn lint && \
	cd ../server && yarn lint && \
	cd ../interval && yarn lint && \
	cd ../worker && yarn lint


update-css:
	cd client && yarn build && \
	cd .. && rm -rf shared/css && cp -rf client/dist/css shared && \
	rm -rf client/dist
serve:
	make reset-redis; docker-compose up
serve-build:
	docker-compose up --build
serve-reset:
	make reset; \
	docker-compose build --no-cache && \
	docker-compose up


REDIS_POD = kube-redis
kube-redis: REDIS_POD = $(shell kubectl get pods -o name | grep redis-deployment | cut -c 5-)
kube-redis:
	kubectl exec -it $(REDIS_POD) sh

POSTGRES_POD = kube-postgres
kube-postgres: POSTGRES_POD = $(shell kubectl get pods -o name | grep postgres-deployment | cut -c 5-)
kube-postgres:
	kubectl exec -it $(POSTGRES_POD) sh


reset:
	docker stop `docker ps -qa`; \
	docker rm `docker ps -qa`; \
	docker rmi -f `docker images -qa`; \
	docker volume rm `docker volume ls -q`; \
	docker network rm `docker network ls -q`
update:
	docker exec -it $(shell docker ps -qf "name=client") sh -c 'rm -f yarn.lock && yarn' && \
	docker exec -it $(shell docker ps -qf "name=api") sh -c 'rm -f yarn.lock && yarn' && \
	docker exec -it $(shell docker ps -qf "name=interval") sh -c 'rm -f yarn.lock && yarn' && \
	docker exec -it $(shell docker ps -qf "name=worker") sh -c 'rm -f yarn.lock && yarn'
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
