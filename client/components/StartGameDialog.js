import React from 'react';
import moment from 'moment';
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

const DEFAULT_TURN_LIMIT = 90;

const getNextHour = () => {
  const now = moment();
  return now.add(1, 'hour').startOf('hour');
};

const getDurationInMinutes = (end) => {
  if (!end) return null;
  const now = moment();
  if (end < now) end = end.clone().add(1, 'day');
  return Math.round(moment.duration(end.diff(now)).asMinutes());
};

const StartGameDialog = ({ starting, startGame, setStarting }) => {
  const classes = useStyles();
  const [turnLimit, setTurnLimit] = React.useState(DEFAULT_TURN_LIMIT);
  const [timeLimit, setTimeLimit] = React.useState(null);
  const [duration, setDuration] = React.useState(null);

  const updateTimeLimit = (limit) => {
    if (!limit) {
      setTimeLimit(null);
      setDuration(null);
      return;
    }

    const nextLimit = limit.clone();
    const diffDays = moment.duration(nextLimit.diff(moment())).asDays();
    nextLimit.subtract(Math.floor(diffDays), 'days');
    setTimeLimit(nextLimit);
    setDuration(getDurationInMinutes(nextLimit));
  };
  const setNextHour = () => updateTimeLimit(getNextHour());
  const setUnlimited = () => updateTimeLimit(null);
  const addMinutes = (minutes) => () => {
    updateTimeLimit(timeLimit.clone().add(minutes, 'm'));
  };
  const closeDialog = () => setStarting(false);

  React.useEffect(() => {
    if (!starting) return;
    setTurnLimit(DEFAULT_TURN_LIMIT);
    setNextHour();
  }, [starting]);

  const turnLimitInt = parseInt(turnLimit);
  const isValid = turnLimitInt >= 10 && turnLimitInt <= 3600 &&
    ((duration >= 1 && duration <= 1440) || (duration === null));

  const startClick = () => {
    if (!isValid) return;
    startGame({
      turnLimit: turnLimitInt,
      duration,
    });
  };

  return <Dialog open={!!starting} onClose={closeDialog}>
    <DialogContent className={classes.contentRow}>
      <TextField
        className={classes.input}
        label='Turn limit'
        type='number'
        value={turnLimit}
        onChange={(event) => setTurnLimit(event.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position='end'>
            {turnLimitInt === 1 ? 'Second' : 'Seconds'}
          </InputAdornment>,
        }}
        inputProps={{
          className: classes.turnInput,
          min: 10,
          max: 3600,
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
      <Button disabled={timeLimit === null} size='small' variant='outlined' onClick={addMinutes(-15)}>
        - 15 m
      </Button>
      <Button disabled={timeLimit === null} size='small' variant='outlined' onClick={addMinutes(15)}>
        + 15 m
      </Button>
    </DialogContent>
    <DialogActions>
      <span className={classes.duration}>
        {duration !== null ? duration : '∞'} {duration === 1 ? 'Minute' : 'Minutes'}
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
