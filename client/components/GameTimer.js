import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles(() => ({
  roundTimer: {
    borderRadius: 4,
  },
}));

const GameTimer = ({ showRoundTime, roundTime, turnTimeLimitSeconds }) => {
  const classes = useStyles();
  return <LinearProgress
    variant='determinate'
    value={100 * roundTime / turnTimeLimitSeconds}
    className={classes.roundTimer}
    style={{ visibility: showRoundTime ? 'visible' : 'hidden' }}
  />;
};

const mapStateToProps = (state) => ({
  roundTime: state.game.roundTime,
  turnTimeLimitSeconds: state.game.turnTimeLimitSeconds,
  showRoundTime: state.game.currentWord && state.game.roundTime,
});

export default connect(mapStateToProps)(GameTimer);
