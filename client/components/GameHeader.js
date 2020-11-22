import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import gameActions from '../store/actions/game';
import logo from '../../assets/logo.svg';

const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: 0,
    flexShrink: 0,
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
  },
  name: {
    marginLeft: theme.spacing(2),
    marginRight: 'auto',
  },
  exit: {
    marginLeft: 'auto',
  },
  word: {
    letterSpacing: 4,
    fontSize: 14,
    textAlign: 'center',
    wordBreak: 'break-all',
    [theme.breakpoints.up('sm')]: {
      letterSpacing: 6,
      fontSize: 24,
    },
  },
}));

const GameHeader = ({ singlePlayer, exit, setStarting, started, word }) => {
  const classes = useStyles();
  const start = () => setStarting(true);

  return <Grid container spacing={3} className={classes.header}>
    <Grid item xs={12} className={classes.headerCell}>
      <img src={logo} className={classes.logo} />
      <Typography variant='h6' className={classes.name}>
        Draw!
      </Typography>
      {!started && <Button variant='outlined' color='primary' onClick={start} disabled={singlePlayer}>
        <Hidden xsDown implementation='css'>
          Start Game
        </Hidden>
        <Hidden smUp implementation='css'>
          Start
        </Hidden>
      </Button>}
      {word && <Box className={classes.word} fontFamily='Monospace'>{word}</Box>}
      <Button onClick={exit} className={classes.exit}>Exit</Button>
    </Grid>
  </Grid>;
};

const mapStateToProps = (state) => ({
  started: state.game.started,
  word: state.game.selectedWord || state.game.currentWord,
  singlePlayer: state.game.players.length <= 1,
});

const mapDispatchToProps = {
  exit: gameActions.exitGame,
  setStarting: gameActions.setStarting,
};

export default connect(mapStateToProps, mapDispatchToProps)(GameHeader);
