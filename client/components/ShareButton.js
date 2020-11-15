// Copyright 2020 Draw authors.

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';

const useStyles = ((canShare) => makeStyles((theme) => ({
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: '12px',
    paddingBottom: '12px',
    [theme.breakpoints.up('sm')]: {
      position: 'relative',
      paddingBottom: 0,
    },
    display: canShare ? 'block' : 'none',
  },
  buttonBackground: {
    fontSize: '0.75rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1rem',
    },
  },
})));

export default () => {
  const shareData = {url: window.location.href};
  const classes = useStyles(navigator.canShare && navigator.canShare(shareData))();
  // TODO: handle navigator.share() failures.
  return <div className={classes.buttonContainer}>
      <Button
        variant='contained'
        color='primary'
        startIcon={<ShareIcon />}
        className={classes.buttonBackground}
        onClick={() => navigator.share(shareData)}
      >
        Share
      </Button>
    </div>
};
