import React from 'react';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import snackbarActions from '../store/actions/snackbars';

const Snackbars = ({ snackbars, hideSnackbar, removeSnackbar }) => {
  const handleHideSnackbar = (event, reason) => {
    if (reason !== 'clickaway') hideSnackbar();
  };

  return snackbars.map(({ data, show }, index) => <Snackbar
    key={index}
    open={show}
    autoHideDuration={data.severity === 'success' ? 1500 : 3000}
    onClose={handleHideSnackbar}
    onExited={removeSnackbar}
  >
    <MuiAlert
      variant='filled'
      onClose={handleHideSnackbar}
      severity={data.severity}
    >
      {data.message}
    </MuiAlert>
  </Snackbar>);
};

const mapStateToProps = (state) => ({
  snackbars: state.snackbars,
});

const mapDispatchToProps = {
  hideSnackbar: snackbarActions.hide,
  removeSnackbar: snackbarActions.remove,
};

export default connect(mapStateToProps, mapDispatchToProps)(Snackbars);
