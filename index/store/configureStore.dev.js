import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';

// middleware
import thunkMiddleware from 'redux-thunk'; // thunk allows reducers to return functions instead of objects

const enhancer = compose(
  applyMiddleware(thunkMiddleware),
  DevTools.instrument()
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  return store;
}
