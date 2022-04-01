import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { connect } from 'react-redux';
import gameActions from '../store/actions/game';

const ExitGameDialog = ({ open, hideDialog, exitGame }) => {
  return <Dialog open={open}>
    <DialogTitle>Are you sure?</DialogTitle>
    <DialogContent>
      Do you want to exit this game?
    </DialogContent>
    <DialogActions>
      <Button variant='outlined' color='primary' onClick={exitGame}>
        Exit
      </Button>
      <Button variant='contained' color='primary' onClick={hideDialog}>
        Keep drawing
      </Button>
    </DialogActions>
  </Dialog>;
};

const mapStateToProps = (state) => ({
  open: state.game.exitGameDialogOpen,
});

const mapDispatchToProps = {
  exitGame: gameActions.exitGame,
  hideDialog: () => gameActions.setExitGameDialogOpen(false),
};

export default connect(mapStateToProps, mapDispatchToProps)(ExitGameDialog);
