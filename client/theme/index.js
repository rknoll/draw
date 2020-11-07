import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

export default (dark) => createMuiTheme({
  palette: {
    type: dark ? 'dark' : 'light',
    primary: {
      main: blue[500],
    },
  },
  typography: {
    useNextVariants: true,
  },
});
