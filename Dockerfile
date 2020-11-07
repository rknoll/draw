FROM node:12-slim

ARG SOUND_FILES
ARG WORDS_FILE

ENV PORT=3000
ENV SOUND_FILES=$SOUND_FILES
ENV WORDS_FILE=$WORDS_FILE

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 3000

CMD [ "npm", "start" ]