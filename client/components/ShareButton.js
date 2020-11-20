import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import snackbarActions from '../store/actions/snackbars';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: 'auto',
    marginBottom: 'auto',
    [theme.breakpoints.down('xs')]: {
      position: 'absolute',
      bottom: 12,
      right: 12,
    },
  },
}));

const ShareButton = ({ showSnackbar }) => {
  const classes = useStyles();
  const shareData = { url: window.location.href };
  const canShare = navigator.canShare && navigator.canShare(shareData);
  const canCopy = navigator.clipboard && navigator.clipboard.writeText;

  if (canShare) {
    const shareUrl = async () => {
      try {
        await navigator.share(shareData);
      } catch (e) {
        if (e.name !== 'AbortError') {
          // Failure wasn't due to the user deciding to cancel the share.
          showSnackbar({ message: `Failed to share: ${e.toString()}`, severity: 'error' });
        }
      }
    };

    return <Button
      variant='contained'
      color='primary'
      className={classes.button}
      startIcon={<ShareIcon />}
      onClick={shareUrl}
    >
      Share
    </Button>;
  }

  if (canCopy) {
    const copyUrl = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showSnackbar({ message: 'Copied link!', severity: 'success' });
      } catch (e) {
        showSnackbar({ message: `Failed to copy link: ${e.toString()}`, severity: 'error' });
      }
    };

    return <Button
      variant='contained'
      color='primary'
      className={classes.button}
      startIcon={<FileCopyIcon />}
      onClick={copyUrl}
    >
      Copy Link
    </Button>;
  }

  return null;
};

const mapDispatchToProps = {
  showSnackbar: snackbarActions.show,
};

export default connect(null, mapDispatchToProps)(ShareButton);
