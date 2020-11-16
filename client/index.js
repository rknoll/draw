import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import store, { history } from './store';
import App from './components/App';
import './index.css';

if ('serviceWorker' in navigator) runtime.register();

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component history={history} />
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  );
};

if (window.self === window.top) {
  render(App);
}

if (module.hot) {
  module.hot.accept('./components/App', () => {
    render(require('./components/App').default);
  });
}
