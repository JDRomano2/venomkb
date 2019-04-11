import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';

// middleware
import thunkMiddleware from 'redux-thunk';

const enhancer = applyMiddleware(thunkMiddleware);

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
