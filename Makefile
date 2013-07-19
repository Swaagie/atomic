FLAGS=--watch 8888

ifeq ($(strip $(W)),0)
	FLAGS=
endif

app:
	./node_modules/.bin/square $(FLAGS) -p minify -d min ./square.json
