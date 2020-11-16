import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import 'fontsource-roboto';
import XkcdScriptWoff from '../../assets/fonts/xkcd-script/xkcd-script.woff';

const XkcdScript = {
  fontFamily: 'xkcd-script',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `url(${XkcdScriptWoff}) format('woff')`,
};

export default (dark) => createMuiTheme({
  palette: {
    type: dark ? 'dark' : 'light',
    primary: {
      main: blue[500],
    },
  },
  typography: {
    useNextVariants: true,
    fontFamily: '"xkcd-script", "Roboto", "Helvetica", "Arial", sans-serif;',
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [XkcdScript],
      },
    },
  },
});
