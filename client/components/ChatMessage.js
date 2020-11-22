import React from 'react';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  userName: {
    maxWidth: '50%',
    display: 'inline-block',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    verticalAlign: 'bottom',
  },
  boldName: {
    fontWeight: 'bold',
  },
  guessText: {
    wordBreak: 'break-all',
  },
  systemText: {
    wordBreak: 'break-all',
    fontStyle: 'italic',
  },
  errorText: {
    wordBreak: 'break-all',
    fontStyle: 'italic',
    color: theme.palette.error.main,
  },
  guess: {
    margin: 0,
    marginTop: theme.spacing() / 2,
    marginBottom: theme.spacing() / 2,
  },
  correct: {
    color: theme.palette.success.main,
  },
}));

const UserName = ({ name, bold, spacing }) => {
  const classes = useStyles();
  const className = classnames(classes.userName, bold && classes.boldName);
  return <span className={className}>{name}{spacing && '\u00A0'}</span>;
};

const Message = ({ name, guess, word, type }) => {
  const classes = useStyles();
  switch (type) {
    case 'GUESS':
      return <React.Fragment>
        <UserName name={name} bold />:&nbsp;
        <span className={classes.guessText}>{guess}</span>
      </React.Fragment>;
    case 'CLOSE_GUESS':
      return <span className={classes.systemText}>
          {guess} is close!
        </span>;
    case 'CORRECT_GUESS':
      return <span className={classes.systemText}>
          <UserName name={name} spacing />guessed the word!
        </span>;
    case 'ALL_GUESSED':
      return <span className={classes.systemText}>
          Everyone guessed the word!
        </span>;
    case 'FAILED_GUESS':
      return <span className={classes.errorText}>
          The word was {word}!
        </span>;
    case 'SKIPPED':
      return <span className={classes.errorText}>
          <UserName name={name} spacing />skipped this round!
        </span>;
    case 'LEAVE_TURN':
      return <span className={classes.errorText}>
          <UserName name={name} spacing />lost the turn!
        </span>;
    case 'LEAVE':
      return <span className={classes.systemText}>
          <UserName name={name} spacing />left the game!
        </span>;
    case 'JOIN':
      return <span className={classes.systemText}>
          <UserName name={name} spacing />joined the game!
        </span>;
    case 'DRAWING':
      return <span className={classes.systemText}>
          <UserName name={name} spacing />is drawing now!
        </span>;
    default:
      return null;
  }
};

export default ({ message }) => {
  const classes = useStyles();
  return <p className={classnames(classes.guess, message.correct && classes.correct)}>
    <Message {...message} />
  </p>;
};
