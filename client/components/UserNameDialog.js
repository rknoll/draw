import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import { connect } from 'react-redux';
import userActions from '../store/actions/user';

const UserNameDialog = ({ name, setName }) => {
  const nameRef = React.useRef(null);

  const onSave = (event) => {
    event.preventDefault();
    const name = nameRef.current.value;
    if (!name) return;
    setName(name);
  };

  return <Dialog open={!name}>
    <DialogTitle>User settings</DialogTitle>
    <DialogContent>
      <form onSubmit={onSave}>
        <TextField
          autoFocus
          margin='dense'
          label='Name'
          fullWidth
          inputRef={nameRef}
        />
      </form>
    </DialogContent>
    <DialogActions>
      <Button variant='contained' color='primary' onClick={onSave}>
        Save
      </Button>
    </DialogActions>
  </Dialog>;
};

const mapStateToProps = (state) => ({
  name: state.user.name,
});

const mapDispatchToProps = {
  setName: userActions.setName,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserNameDialog);
