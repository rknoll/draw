import Joi from 'joi/lib/index';
import {
  COLORS,
  MAX_GAME_DURATION_MINUTES,
  MAX_TURN_TIME_LIMIT_SECONDS,
  MIN_GAME_DURATION_MINUTES,
  MIN_TURN_TIME_LIMIT_SECONDS,
  WIDTHS
} from '../shared/constants';
import protocol from '../shared/protocol';

const validPosition = Joi.object({
  x: Joi.number().min(0).max(800).required(),
  y: Joi.number().min(0).max(600).required(),
}).required();

const validColor = Joi.string().valid(...COLORS).required();

export default {
  [protocol.JOIN]: Joi.object({
    id: Joi.string().min(1).max(255).required(),
    user: Joi.object({
      name: Joi.string().min(1).max(255).required(),
    }).required(),
  }).required(),
  [protocol.PONG]: Joi.any(),
  [protocol.START]: Joi.object({
    turnTimeLimitSeconds: Joi.number().integer().min(MIN_TURN_TIME_LIMIT_SECONDS).max(MAX_TURN_TIME_LIMIT_SECONDS).required(),
    durationMinutes: Joi.alternatives().try(
      Joi.number().integer().min(MIN_GAME_DURATION_MINUTES).max(MAX_GAME_DURATION_MINUTES).required(),
      Joi.valid(null).required(),
    ).required(),
  }).required(),
  [protocol.GUESS]: Joi.string().min(1).max(255).required(),
  [protocol.USE_WORD]: Joi.string().allow('').max(255).required(),
  [protocol.COMMAND]: Joi.alternatives([
    Joi.object({ type: Joi.string().equal('clear').required() }),
    Joi.object({ type: Joi.string().equal('undo').required() }),
    Joi.object({ type: Joi.string().equal('done').required() }),
    Joi.object({ type: Joi.string().equal('fill').required() }),
    Joi.object({ type: Joi.string().equal('erase').required() }),
    Joi.object({
      type: Joi.string().equal('line').required(),
      from: validPosition,
      to: validPosition,
      color: validColor,
      width: Joi.number().valid(...WIDTHS).required(),
    }),
    Joi.object({
      type: Joi.string().equal('erase').required(),
      from: validPosition,
      to: validPosition,
    }),
    Joi.object({
      type: Joi.string().equal('fill').required(),
      position: validPosition,
      color: validColor,
    }),
  ]).match('one').required(),
  [protocol.REVEAL_CHARACTER]: Joi.number().integer().min(0).max(255).required(),
};
