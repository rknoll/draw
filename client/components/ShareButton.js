import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';

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
  const shareData = {url: window.location.href};
  const classes = useStyles(navigator.canShare && navigator.canShare(shareData))();
  // TODO: handle navigator.share() failures.
  return <Button
      variant='contained'
      color='primary'
      startIcon={<ShareIcon />}
      className={classes.button}
      onClick={() => navigator.share(shareData)}
    >
      Share
    </Button>
};
