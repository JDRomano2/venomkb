import "@babel/polyfill";

import React from 'react';
import ReactDOM from 'react-dom';

import { Switch, Route } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from './index/store/configureStore';

// handle api calls from within app
import { getDbIndex } from './index/helpers/api_fetch';

import 'react-table/react-table.css';
import './index/styles/venomkb.css';
import './index/img/images';

import Root from './index/containers/Root';

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

    ReactDOM.render(
        <Root store={store} />,
        document.getElementById('venomkb_root')
    );
});
