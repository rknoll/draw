import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware as createRouterMiddleware } from 'connected-react-router'
import { createLogger as createLoggerMiddleware } from 'redux-logger'
import { createBrowserHistory } from 'history';
import createRootReducer from './reducers';
import sagas from './sagas';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const history = createBrowserHistory();

const routerMiddleware = createRouterMiddleware(history);
const loggerMiddleware = process.env.NODE_ENV === 'development' && createLoggerMiddleware();
const sagaMiddleware = createSagaMiddleware();


const middlewares = [
  routerMiddleware,
  loggerMiddleware,
  sagaMiddleware,
].filter(Boolean);

const store = createStore(
  createRootReducer(history),
  composeEnhancers(applyMiddleware(...middlewares))
);

sagaMiddleware.run(sagas);

if (module.hot) {
  module.hot.accept('./reducers', () => {
    const nextCreateRootReducer = require('./reducers').default;
    store.replaceReducer(nextCreateRootReducer(history));
  });
}

export default store;
