import React from 'react';
import {
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  differenceInMinutes,
  startOfHour
} from 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { KeyboardTimePicker } from '@material-ui/pickers';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import ScheduleIcon from '@material-ui/icons/Schedule';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { connect } from 'react-redux';
import {
  MAX_GAME_DURATION_MINUTES,
  MAX_TURN_TIME_LIMIT_SECONDS,
  MIN_GAME_DURATION_MINUTES,
  MIN_TURN_TIME_LIMIT_SECONDS
} from '../../shared/constants';
import gameActions from '../store/actions/game';

const useStyles = makeStyles((theme) => ({
  contentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    '&>*': {
      marginLeft: theme.spacing(),
    },
    '&>:first-child': {
      marginLeft: 0,
    },
  },
  input: {
    width: 0,
    flexGrow: 1,
  },
  unlimited: {
    marginTop: 'auto',
  },
  turnInput: {
    '&::-webkit-outer-spin-button,&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '-moz-appearance': 'textfield',
  },
  duration: {
    marginLeft: theme.spacing(2),
    marginRight: 'auto',
  },
}));

const DEFAULT_TURN_TIME_LIMIT_SECONDS = 90;

const getNextHour = () => {
  const now = new Date();
  return startOfHour(addHours(now, 1));
};

const getDurationInMinutes = (end) => {
  if (!end) return null;
  const now = new Date();
  if (end < now) end = addDays(end, 1);
  return differenceInMinutes(end, now);
};

const StartGameDialog = ({ starting, startGame, setStarting }) => {
  const classes = useStyles();
  const [turnTimeLimitSeconds, setTurnTimeLimitSeconds] = React.useState(DEFAULT_TURN_TIME_LIMIT_SECONDS);
  const [timeLimit, setTimeLimit] = React.useState(null);
  const [durationMinutes, setDurationMinutes] = React.useState(null);

  const updateTimeLimit = (limit) => {
    if (!limit) {
      setTimeLimit(null);
      setDurationMinutes(null);
      return;
    }

    const diffDays = differenceInDays(new Date(), limit);
    const nextLimit = addDays(limit, diffDays);
    setTimeLimit(nextLimit);
    setDurationMinutes(getDurationInMinutes(nextLimit));
  };
  const setNextHour = () => updateTimeLimit(getNextHour());
  const setUnlimited = () => updateTimeLimit(null);
  const handleAddMinutes = (minutes) => () => {
    updateTimeLimit(addMinutes(timeLimit, minutes));
  };
  const closeDialog = () => setStarting(false);

  React.useEffect(() => {
    if (!starting) return;
    setTurnTimeLimitSeconds(DEFAULT_TURN_TIME_LIMIT_SECONDS);
    setNextHour();
  }, [starting]);

  const turnTimeLimitSecondsInt = parseInt(turnTimeLimitSeconds);
  const isValid = turnTimeLimitSecondsInt >= MIN_TURN_TIME_LIMIT_SECONDS && turnTimeLimitSecondsInt <= MAX_TURN_TIME_LIMIT_SECONDS &&
    ((durationMinutes >= MIN_GAME_DURATION_MINUTES && durationMinutes <= MAX_GAME_DURATION_MINUTES) || (durationMinutes === null));

  const startClick = () => {
    if (!isValid) return;
    startGame({
      turnTimeLimitSeconds: turnTimeLimitSecondsInt,
      durationMinutes,
    });
  };

  return <Dialog open={!!starting} onClose={closeDialog}>
    <DialogContent className={classes.contentRow}>
      <TextField
        className={classes.input}
        label='Turn limit'
        type='number'
        value={turnTimeLimitSeconds}
        onChange={(event) => setTurnTimeLimitSeconds(event.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position='end'>
            {turnTimeLimitSecondsInt === 1 ? 'Second' : 'Seconds'}
          </InputAdornment>,
        }}
        inputProps={{
          className: classes.turnInput,
          min: MIN_TURN_TIME_LIMIT_SECONDS,
          max: MAX_TURN_TIME_LIMIT_SECONDS,
        }}
      />
    </DialogContent>
    <DialogContent className={classes.contentRow}>
      <KeyboardTimePicker
        className={classes.input}
        ampm={false}
        label='End time'
        keyboardIcon={<ScheduleIcon />}
        value={timeLimit}
        onChange={updateTimeLimit}
      />
      <Button size='small' variant='outlined' className={classes.unlimited} onClick={setUnlimited}>
        Unlimited
      </Button>
    </DialogContent>
    <DialogContent className={classes.contentRow}>
      <Button size='small' variant='outlined' onClick={setNextHour}>
        Next Full Hour
      </Button>
      <Button disabled={timeLimit === null} size='small' variant='outlined' onClick={handleAddMinutes(-15)}>
        - 15 m
      </Button>
      <Button disabled={timeLimit === null} size='small' variant='outlined' onClick={handleAddMinutes(15)}>
        + 15 m
      </Button>
    </DialogContent>
    <DialogActions>
      <span className={classes.duration}>
        {durationMinutes !== null ? durationMinutes : '∞'} {durationMinutes === 1 ? 'Minute' : 'Minutes'}
      </span>
      <Button disabled={!isValid} variant='contained' color='primary' onClick={startClick}>
        Start Game
      </Button>
    </DialogActions>
  </Dialog>;
};

const mapStateToProps = (state) => ({
  starting: state.game.starting,
});

const mapDispatchToProps = {
  startGame: gameActions.startGame,
  setStarting: gameActions.setStarting,
};

export default connect(mapStateToProps, mapDispatchToProps)(StartGameDialog);
