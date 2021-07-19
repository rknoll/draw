import path from 'path';
import bunyan from 'bunyan';
import bunyanDebugStream from 'bunyan-debug-stream';

const logger = bunyan.createLogger({
  name: 'draw',
  streams: [{
    level: 'info',
    type: 'raw',
    stream: bunyanDebugStream({
      basepath: path.join(__dirname, '..'),
      forceColor: true,
    }),
  }],
  serializers: bunyanDebugStream.serializers
});

export default logger;
