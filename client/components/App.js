import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import mainTheme from '../theme';
import LandingPage from './LandingPage';
import GamePage from './GamePage';
import UserNameDialog from './UserNameDialog';
import WordSelectionDialog from './WordSelectionDialog';
import StartGameDialog from './StartGameDialog';
import ExitGameDialog from './ExitGameDialog';
import Snackbars from './Snackbars';

export default ({ history }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return <ConnectedRouter history={history}>
    <ThemeProvider theme={mainTheme(prefersDarkMode)}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CssBaseline />
        <Switch>
          <Route path='/' exact={true} component={LandingPage} />
          <Route path='/:id' component={GamePage} />
        </Switch>
        <UserNameDialog />
        <WordSelectionDialog />
        <StartGameDialog />
        <ExitGameDialog />
        <Snackbars />
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  </ConnectedRouter>;
}
