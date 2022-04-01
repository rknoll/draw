import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import gameActions from '../store/actions/game';
import toolActions from '../store/actions/tool';
import logo from '../../assets/logo.svg';
import CurrentWord from './CurrentWord';

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
}));

const GameHeader = ({ singlePlayer, exitGame, showExitDialog, setStarting, started, updateTool }) => {
  const classes = useStyles();
  const start = () => setStarting(true);
  const exit = started ? showExitDialog : exitGame;

  return <Grid container spacing={3} className={classes.header}>
    <Grid item xs={12} className={classes.headerCell}>
      <img src={logo} className={classes.logo} onClick={() => updateTool({ type: 'line', color: 'rainbow' })} />
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
      <CurrentWord />
      <Button onClick={exit} className={classes.exit}>Exit</Button>
    </Grid>
  </Grid>;
};

const mapStateToProps = (state) => ({
  started: state.game.started,
  singlePlayer: state.game.players.length <= 1,
});

const mapDispatchToProps = {
  exitGame: gameActions.exitGame,
  showExitDialog: () => gameActions.setExitGameDialogOpen(true),
  setStarting: gameActions.setStarting,
  updateTool: toolActions.updateTool,
};

export default connect(mapStateToProps, mapDispatchToProps)(GameHeader);
