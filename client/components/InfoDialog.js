import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

const useStyles = makeStyles((theme) => ({
  key: {
    marginRight: theme.spacing(),
  },
  value: {
    display: 'inline-block',
    color: theme.palette.text.secondary,
  },
}));

export default ({ open, onClose }) => {
  const classes = useStyles();

  return <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <DialogContentText>
        <b className={classes.key}>Timestamp:</b>
        <span className={classes.value}>{BUILDTIME}</span>
      </DialogContentText>
      <DialogContentText>
        <b className={classes.key}>Commit:</b>
        <a className={classes.value} target='_blank'
           href={`https://github.com/rknoll/draw/commit/${COMMITHASH}`}>
          {COMMITHASH.substr(0, 7)}
        </a>
      </DialogContentText>
      <DialogContentText>
        <b className={classes.key}>Font:</b>
        <a className={classes.value} target='_blank'
           href='https://github.com/ipython/xkcd-font'>
          xkcd-script
        </a>
      </DialogContentText>
    </DialogContent>
  </Dialog>;
};
