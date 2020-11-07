import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import gameActions from '../store/actions/game';
import ChatMessage from './ChatMessage';

const useStyles = makeStyles((theme) => ({
  guesses: {
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    order: 2,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    [theme.breakpoints.up('sm')]: {
      order: 1,
      flexDirection: 'column-reverse',
    },
  },
  guessForm: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    order: 1,
    [theme.breakpoints.up('sm')]: {
      order: 2,
    },
  },
}));

const GameChat = ({ sendGuess, guesses }) => {
  const classes = useStyles();
  const guess = React.useRef(null);
  const submitGuess = (event) => {
    event.preventDefault();
    if (!guess.current.value) return;
    sendGuess(guess.current.value);
    guess.current.value = '';
  };

  return <React.Fragment>
    <div className={classes.guesses}>
      {[...guesses].reverse().map((message, index) => <ChatMessage key={index} message={message} />)}
    </div>
    <form className={classes.guessForm} onSubmit={submitGuess}>
      <TextField label='Guess' variant='outlined' size='small' inputRef={guess} />
    </form>
  </React.Fragment>;
};

const mapStateToProps = (state) => ({
  guesses: state.game.guesses,
});

const mapDispatchToProps = {
  sendGuess: gameActions.guess,
};

export default connect(mapStateToProps, mapDispatchToProps)(GameChat);
