import { v4 as uuidv4 } from 'uuid';
import formatISO from 'date-fns/formatISO';
import fs from 'fs';
import path from 'path';

let folder = process.env.HISTORY_FOLDER && path.resolve(process.env.HISTORY_FOLDER);
if (!fs.existsSync(folder)) folder = null;

class History {
  events = [];

  constructor(game, options) {
    this.game = game;
    this.id = uuidv4();
    this.startTime = formatISO(new Date());
    this.addEvent('start', {
      ...options,
      players: game.users(),
    });
  }

  close() {
    this.endTime = formatISO(new Date());
    this.addEvent('end', {
      points: this.game.points(),
    });
    this.flush();
  }

  flush() {
    const fileName = path.join(folder, `${this.startTime}-${this.id}.json`);
    fs.writeFileSync(fileName, JSON.stringify({
      historyId: this.id,
      gameId: this.game.id,
      startTime: this.startTime,
      endTime: this.endTime,
      events: this.events,
    }));
  }

  addEvent(type, data) {
    this.events.push({
      type,
      timestamp: formatISO(new Date()),
      ...data,
    });
  }
};

export default (game, options) => {
  if (!folder) return null;
  return new History(game, options);
};
