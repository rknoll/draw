import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Scratchpad from './Scratchpad';
import Controls from './Controls';
import UserList from './UserList';
import GameHeader from './GameHeader';
import GameChat from './GameChat';
import GameTimer from './GameTimer';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(4),
    },
  },
  paper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flexGrow: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    marginTop: 0,
    marginBottom: 0,
    minHeight: 0,
    maxHeight: '100vh',
    flexGrow: 1,
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
  },
  drawing: {
    order: 1,
    flexBasis: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '40vh',
    [theme.breakpoints.up('sm')]: {
      flexGrow: 1,
      order: 2,
      flexBasis: '100%',
      height: 'auto',
    },
  },
  chat: {
    flexGrow: 1,
    order: 2,
    flexBasis: 'auto',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '30vh',
    [theme.breakpoints.up('sm')]: {
      order: 3,
      flexBasis: '100%',
      maxHeight: '100%',
    },
  },
  players: {
    order: 3,
    flexBasis: 'auto',
    maxHeight: '15vh',
    overflowY: 'auto',
    [theme.breakpoints.up('sm')]: {
      order: 1,
      flexBasis: '100%',
      maxHeight: '100%',
    },
  },
  roundTimer: {
    borderRadius: 4,
  },
}));

export default () => {
  const classes = useStyles();
  return <div className={classes.root}>
    <Paper className={classes.paper}>
      <GameTimer />
      <Container className={classes.container} maxWidth={false}>
        <GameHeader />
        <Grid container spacing={3} className={classes.wrapper}>
          <Grid item xs={12} sm={2} className={classes.players}>
            <UserList />
          </Grid>
          <Grid item xs={12} sm={7} className={classes.drawing}>
            <Scratchpad />
            <Controls />
          </Grid>
          <Grid item xs={12} sm={3} className={classes.chat}>
            <GameChat />
          </Grid>
        </Grid>
      </Container>
    </Paper>
  </div>;
};
