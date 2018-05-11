import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import DevTools from './DevTools';
import { ConnectedRouter } from 'react-router-redux';
import routes from '../routes/routes.js';

export default class Root extends Component {
    static propTypes = {
        store: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    };

    render() {
        const { store, history } = this.props;
        console.log('Attempting to render with ConnectedRouter.');
        return (
            <Provider store={store}>
                <div>
                    <ConnectedRouter history={history} routes={routes} />
                    <DevTools />
                </div>
            </Provider>
        );
    }
}
