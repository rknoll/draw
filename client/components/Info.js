import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InfoDialog from './InfoDialog';
import IconButton from '@material-ui/core/IconButton';
import HelpOutline from '@material-ui/icons/HelpOutline';

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: 'auto',
    position: 'absolute',
    bottom: 0,
    left: 0,
    [theme.breakpoints.up('sm')]: {
      position: 'relative',
      marginLeft: -12,
    },
  },
  icon: {
    fontSize: '1.25rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem',
    },
  },
}));

export default () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  return <React.Fragment>
    <IconButton color='primary' className={classes.button} onClick={() => setOpen(true)}>
      <HelpOutline className={classes.icon} />
    </IconButton>
    <InfoDialog open={open} onClose={() => setOpen(false)} />
  </React.Fragment>;
};
