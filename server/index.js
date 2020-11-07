import path from 'path';
import express from 'express';
import http from 'http';
import compression from 'compression';
import socketIO from 'socket.io';
import protocol from '../shared/protocol';
import validators from './validators';
import Games from './Games';

const statics = path.join(__dirname, '../public');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIO(server);
const games = new Games(io);

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
  console.log(`${socket.id}: connected`);

  socket.on('disconnect', async () => {
    console.log(`${socket.id}: disconnected`);
    games.leave(socket.id);
  });

  socket.use(([message, data], next) => {
    const validator = validators[message];
    if (!validator || validator.validate(data).error) {
      console.log(`${socket.id}: invalid message`);
      return next(new Error('error'));
    }
    next();
  });

  socket.on(protocol.JOIN, async (data) => {
    const { id, user } = data;
    Object.keys(socket.rooms).forEach((room) => socket.leave(room));
    socket.join(id, (err) => {
      if (err) {
        socket.disconnect(true);
        return;
      }
      games.join(socket, id, user);
    });
  });

  socket.on(protocol.GUESS, (guess) => games.guess(socket.id, guess));
  socket.on(protocol.COMMAND, (command) => games.command(socket.id, command));
  socket.on(protocol.START, () => games.start(socket.id));
  socket.on(protocol.USE_WORD, (word) => games.useWord(socket.id, word));
});

server.listen(port, () => console.log(`Listening on port ${port}!`));
