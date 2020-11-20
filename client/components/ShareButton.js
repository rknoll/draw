import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = ((canShare) => makeStyles((theme) => ({
  button: {
    marginTop: 'auto',
    marginBottom: 'auto',
    display: canShare ? 'inline-flex' : 'none',
    [theme.breakpoints.down('xs')]: {
      position: 'absolute',
      bottom: 12,
      right: 12,
    },
  },
})));

export default () => {
  const [state, setState] = useState({showSnackbar: false});
  const shareData = {url: window.location.href};
  const classes = useStyles(navigator.canShare && navigator.canShare(shareData))();

  const share = async (shareData) => {
    try {
      await navigator.share(shareData);
    } catch (e) {
      if (e.name !== 'AbortError') {
        // Failure wasn't due to the user deciding to cancel the share.
        setState({error: e.toString(), showSnackbar: true});
      }
    }
  };

  const closeSnackbar = () => setState({error: state.error, showSnackbar: false});
  return <div>
      <Button
        variant='contained'
        color='primary'
        startIcon={<ShareIcon />}
        className={classes.button}
        onClick={() => share(shareData)}
      >
        Share
      </Button>
      <Snackbar open={state.showSnackbar} autoHideDuration={3000} onClose={closeSnackbar}>
        <MuiAlert variant='filled' onClose={closeSnackbar} severity='error'>
          Failed to share: {state.error}.
        </MuiAlert>
      </Snackbar>
    </div>
};
