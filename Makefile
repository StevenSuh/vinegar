dev:
	cd client && yarn serve >/dev/null & cd server && yarn serve >/dev/null
install:
	cd client && yarn && cd ../server && yarn
prettier:
	prettier --write **/*.js **/*.vue
lint:
	cd client && yarn lint --fix && cd ../server && yarn lint --fix && cd .. && make prettier
serve-cache:
	docker-compose up
serve:
	docker-compose up --build
