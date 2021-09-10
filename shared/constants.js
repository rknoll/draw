import ms from 'ms';

export const PING_TIMEOUT = ms('10s');
export const SELECT_WORD_TIMEOUT = ms('10s');
export const TICK_TIMEOUT = ms('8s');

export const MIN_TURN_TIME_LIMIT_SECONDS = 10;
export const MAX_TURN_TIME_LIMIT_SECONDS = 3600;

export const MIN_GAME_DURATION_MINUTES = 1;
export const MAX_GAME_DURATION_MINUTES = 1440;

export const COLORS = [
  '#FFFFFF',
  '#C1C1C1',
  '#EF130B',
  '#FF7100',
  '#FFE400',
  '#00CC00',
  '#00B2FF',
  '#231FD3',
  '#A300BA',
  '#D37CAA',
  '#A0522D',
  '#000000',
  '#4C4C4C',
  '#740B07',
  '#C23800',
  '#E8A200',
  '#005510',
  '#00569E',
  '#0E0865',
  '#550069',
  '#A75574',
  '#63300D',
];

export const WIDTHS = [
  4,
  10,
  20,
  40,
];

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const MAX_CANDIDATES = 3;
