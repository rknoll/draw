import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import logo from '../../assets/logo.svg';
import gameActions from '../store/actions/game';
import userActions from '../store/actions/user';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    margin: 'auto',
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  createButton: {
    margin: 'auto',
    marginTop: theme.spacing(2),
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    display: 'flex',
    margin: 'auto',
    marginTop: theme.spacing(8),
  },
  titleText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(4),
  },
}));

const LandingPage = ({ name, createGame, joinGame, changeName }) => {
  const classes = useStyles();
  const [isJoinOpen, setJoinOpen] = React.useState(false);
  const joinIdRef = React.createRef(null);
  const openJoinGame = () => setJoinOpen(true);
  const closeJoinGame = () => setJoinOpen(false);

  const onJoin = (e) => {
    e.preventDefault();
    if (!joinIdRef) return;
    const id = joinIdRef.current.value;
    if (!id) return;
    joinGame(id);
  };

  return <div className={classes.root}>
    <div className={classes.title}>
      <Typography variant='h2' className={classes.titleText}>
        Draw!
      </Typography>
      <img src={logo} className={classes.logo} />
    </div>
    <Paper className={classes.container}>
      {
        name && <Typography variant='h6'>
          Welcome {name}!
        </Typography>
      }
      <Button variant='contained' color='primary' className={classes.createButton} onClick={createGame}>
        Create game
      </Button>
      <Button variant='contained' color='primary' className={classes.createButton} onClick={openJoinGame}>
        Join game
      </Button>
      <Button variant='contained' color='primary' className={classes.createButton} onClick={changeName}>
        Change name
      </Button>
    </Paper>
    <Dialog open={isJoinOpen} onClose={closeJoinGame}>
      <DialogTitle>Join game</DialogTitle>
      <DialogContent>
        <form onSubmit={onJoin}>
          <TextField
            autoFocus
            margin='dense'
            label='id'
            fullWidth
            inputRef={joinIdRef}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='primary' onClick={onJoin}>
          Join
        </Button>
      </DialogActions>
    </Dialog>
  </div>;
};

const mapStateToProps = (state) => ({
  name: state.user.name,
});

const mapDispatchToProps = {
  createGame: gameActions.createGame,
  joinGame: (id) => push(`/${id}`),
  changeName: () => userActions.setName(''),
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
