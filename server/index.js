import path from 'path';
import express from 'express';
import http from 'http';
import compression from 'compression';
import socketIO from 'socket.io';
import bunyan from 'bunyan';
import expressBunyanLogger from 'express-bunyan-logger';
import bunyanDebugStream from 'bunyan-debug-stream';
import protocol from '../shared/protocol';
import validators from './validators';
import Games from './Games';

const log = bunyan.createLogger({
  name: 'draw',
  streams: [{
    level: 'info',
    type: 'raw',
    stream: bunyanDebugStream({
      basepath: __dirname, // this should be the root folder of your project.
      forceColor: true,
    }),
  }],
  serializers: bunyanDebugStream.serializers
});

const statics = path.join(__dirname, '../public');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIO(server);
const games = new Games(io);

app.use(expressBunyanLogger({
  logger: log,
}));

app.use(compression());

app.use(express.static(statics, {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    const hashRegExp = /(\.[0-9a-f]{8}\.)|(assets\/[0-9a-f]{8}\/)/;
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (hashRegExp.test(path)) {
      res.setHeader('Cache-Control', 'max-age=31536000');
    }
  },
}));

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(statics, 'index.html'));
});

io.sockets.on('connect', async (socket) => {
  log.info(`${socket.id}: connected`);

  socket.on('disconnect', async () => {
    games.leave(socket.id);
    log.info(`${socket.id}: disconnected. Running games: ${Object.keys(games.games).length}`);
  });

  socket.use(([message, data], next) => {
    const validator = validators[message];
    if (!validator || validator.validate(data).error) {
      log.warn(`${socket.id}: invalid message: ${JSON.stringify(data)}`);
      return next(new Error('error'));
    }
    next();
  });

  socket.on(protocol.JOIN, async (data) => {
    const { id, user } = data;
    Object.keys(socket.rooms).forEach((room) => socket.leave(room));
    socket.join(id, (err) => {
      if (err) {
        log.error(`Failed to join ${socket.id} with ${id}`);
        socket.disconnect(true);
        return;
      }
      games.join(socket, id, user);
      log.info(`${socket.id}: joined ${id} as ${user && user.name || '<unknown>'}. Running games: ${Object.keys(games.games).length}`);
    });
  });

  socket.on(protocol.GUESS, (guess) => games.guess(socket.id, guess));
  socket.on(protocol.COMMAND, (command) => games.command(socket.id, command));
  socket.on(protocol.START, (options) => games.start(socket.id, options));
  socket.on(protocol.USE_WORD, (word) => games.useWord(socket.id, word));
});

server.listen(port, () => log.info(`Listening on port ${port}!`));
