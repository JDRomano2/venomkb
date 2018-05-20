import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';

// middleware
import thunkMiddleware from 'redux-thunk';

console.log("Calling configureStore.prod.js");

const enhancer = applyMiddleware(thunkMiddleware);

export default function configureStore(initialState) {
    return createStore(rootReducer, initialState, enhancer);
};
