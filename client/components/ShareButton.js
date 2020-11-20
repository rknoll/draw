import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import FileCopyIcon from '@material-ui/icons/FileCopy';

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
  const canShare = navigator.canShare && navigator.canShare(shareData);
  const canCopy = navigator.clipboard && navigator.clipboard.writeText;
  const classes = useStyles(canShare || canCopy)();

  const showSuccess = (message) => setState({
    ...state,
    snackbarMessage: message,
    showSnackbar: true,
    snackbarAutoHideDuration: 1500,
    snackbarSeverity: 'success'
  });
  const showError = (message) => setState({
    ...state,
    snackbarMessage: message,
    showSnackbar: true,
    snackbarAutoHideDuration: 3000,
    snackbarSeverity: 'error'
  });

  const share = async (shareData) => {
    try {
      await navigator.share(shareData);
    } catch (e) {
      if (e.name !== 'AbortError') {
        // Failure wasn't due to the user deciding to cancel the share.
        showError(`Failed to share: ${e.toString()}`);
      }
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Copied link!');
    } catch (e) {
      showError(`Failed to copy link: ${e.toString()}`);
    }
  };

  const icon = canShare ? <ShareIcon /> : <FileCopyIcon />;
  const buttonText = canShare ? 'Share' : 'Copy Link';
  const buttonAction = canShare ? () => share(shareData) : copyUrl;
  const closeSnackbar = () => setState({...state, showSnackbar: false});
  return <div>
      <Button
        variant='contained'
        color='primary'
        startIcon={icon}
        className={classes.button}
        onClick={buttonAction}
      >
        {buttonText}
      </Button>
      <Snackbar
        open={state.showSnackbar}
        autoHideDuration={state.snackbarAutoHideDuration}
        onClose={closeSnackbar}
      >
        <MuiAlert
          variant='filled'
          onClose={closeSnackbar}
          severity={state.snackbarSeverity}
        >
          {state.snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
};
