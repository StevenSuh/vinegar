serve:
	cd client && yarn serve >/dev/null & cd server && yarn serve >/dev/null
install:
	cd client && yarn && cd ../server && yarn
prettier:
	prettier --single-quote --trailing-comma es5 --print-width 80 --write --no-bracket-spacing **/*.js **/*.vue
lint:
	make prettier && cd client && yarn lint --fix && cd ../server && yarn lint --fix
