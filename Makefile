serve:
	cd client && npm run serve &>/dev/null & cd server && npm run serve
prettier:
	prettier --single-quote --trailing-comma es5 --print-width 80 --write --no-bracket-spacing **/*.js **/*.vue
lint:
	make prettier
