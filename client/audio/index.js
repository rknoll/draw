const play = (file) => {
  const audio = new Audio(require(`../../${process.env.SOUND_FILES}/${file}`));
  return async () => {
    try {
      await audio.play();
    } catch (error) {
      // We might not have had a user interaction yet.
    }
  }
};

export default {
  JOIN: play('join.ogg'),
  LEAVE: play('leave.ogg'),
  PLAYER_GUESSED: play('playerGuessed.ogg'),
  ROUND_END_FAILURE: play('roundEndFailure.ogg'),
  ROUND_END_SUCCESS: play('roundEndSuccess.ogg'),
  ROUND_START: play('roundStart.ogg'),
  TICK: play('tick.ogg'),
};
