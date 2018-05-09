import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { AppContainer } from 'react-hot-loader';

import configureStore from './index/store/configureStore';
import Root from './index/containers/Root';

// handle api calls from within app
import { getDbIndex } from './index/helpers/api_fetch';

// Require CSS in packages
import 'react-table/react-table.css';

// Require things that webpack needs to move to dist
import './index/styles/venomkb.css';
import './index/img/images';

getDbIndex().then((indexData) => {
    const species = indexData.index.filter( (i) => {
        if (i.data_type === 'Species') {
            return true;
        }
        return false;
    });

    const proteins = indexData.index.filter( (i) => {
        if (i.data_type === 'Protein') {
            return true;
        }
        return false;
    });

    const genomes = indexData.index.filter( (i) => {
        if (i.data_type === 'Genome') {
            return true;
        }
        return false;
    });

    const index = indexData.index;
    const systemiceffects = indexData.systemicEffects;

    const store = configureStore({
        resources: {
            proteins,
            species,
            genomes,
            systemiceffects,
            index
        }
    });
    const history = syncHistoryWithStore(browserHistory, store);

    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById('venomkb_root')
    );

    if (module.hot) {
        module.hot.accept('./index/containers/Root', () => {
            const NewRoot = require('./index/containers/Root').default;
            render(
                <AppContainer>
                    <NewRoot store={store} history={history} />
                </AppContainer>,
                document.getElementById('venomkb_root')
            );
        });
    }
});
