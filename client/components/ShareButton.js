// Copyright 2020 Draw authors.

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import share from '../../assets/shareButton.png';

const useStyles = ((canShare) => makeStyles((theme) => ({
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    [theme.breakpoints.up('sm')]: {
      position: 'relative',
    },
    display: canShare ? 'block' : 'none',
  },
  buttonBackground: {
    backgroundImage: `url("${share}")`,
    height: '20px',
    width: '149px',
    backgroundPosition: '0 0',
    '&:hover': {
        'background-position': '0 -20px',
    },
    fontSize: '1.25rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem',
    },
  },
})));

export default () => {
  const shareData = {url: window.location.href};
  const classes = useStyles(navigator.canShare && navigator.canShare(shareData))();
  // TODO: handle navigator.share() failures.
  return <div className={classes.buttonContainer}>
      <Button className={classes.buttonBackground} onClick={() => navigator.share(shareData)} />
    </div>
};
