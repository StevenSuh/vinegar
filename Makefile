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
serve-no-cache:
	docker-compose down && make serve 
serve-reset:
	docker-compose down && docker-compose rm --all && docker-compose pull && docker-compose up --build
