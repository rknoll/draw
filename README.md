# Draw!

This is the sourcecode for the collaborative drawing game. You can find a running instance at https://draw.rknoll.at
but please use it responsibly.

## Development instructions

```
nvm use
npm install
npm run dev
```

This will start a local node and webpack dev server. You can reach the app at http://localhost:8080. The setup is
configured with hot reloading so you should see changes instantly.

## Deployment instructions

This project has a [Dockerfile](Dockerfile) that can be used to build a docker container. It will do all the build
steps internally so you just need to deploy it somewhere and forward port 3000 to it. Alternatively you can pass an
environment variable `PATH` to customize the listening port.

To manually deploy this app you probably want to build the statics by running `npm run build` which will output all
built assets to a `public` folder. You then need to deploy that along with the node server.

## Custom wordlist and sounds

This repo does not contain a wordlist or sounds for the game. You can provide your own and put them into
[data/words.json](data/words.json) and [assets/sounds](assets/sounds) or override the path to those with custom
environment variables `WORDS_FILE` (at runtime) and `SOUND_FILES` (at build time).
