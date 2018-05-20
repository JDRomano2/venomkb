import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import { Switch, Route } from 'react-router';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
// import DevTools from './index/containers/DevTools';
import createHistory from 'history/createBrowserHistory';
import configureStore from './index/store/configureStore';

// handle api calls from within app
import { getDbIndex } from './index/helpers/api_fetch';

import 'react-table/react-table.css';
import './index/styles/venomkb.css';
import './index/img/images';

// import App from './index/components/App';
import Home from './index/components/Home';
import About from './index/components/About';
import AboutFeatures from './index/components/AboutFeatures';
import AboutVenomseq from './index/components/AboutVenomseq';
import AboutOntology from './index/components/AboutOntology';
import AboutVenoms from './index/components/AboutVenoms';
import AboutApi from './index/components/AboutApi';
import Contact from './index/components/Contact';
import Publications from './index/components/Publications';
import Download from './index/components/Download';
import NotFound from './index/components/NotFound';

import DataContainer from './index/containers/DataContainer';
import DataDetailContainer from './index/containers/DataDetailContainer';
import DevTools from './index/containers/DevTools';

const App = () => (
    <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/about/features" component={AboutFeatures} />
        <Route path="/about/venomseq" component={AboutVenomseq} />
        <Route path="/about/ontology" component={AboutOntology} />
        <Route path="/about/whyvenoms" component={AboutVenoms} />
        <Route path="/about/api" components={AboutApi} />
        <Route path="/contact" component={Contact} />
        <Route path="/publications" component={Publications} />
        <Route path="/data" component={DataContainer} />
        <Route path="/download" component={Download} />
        <Route path="/:index" component={DataDetailContainer} />
        <Route path="*" component={NotFound} />
    </Switch>
);

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
    const history = createHistory();

    if (process.env.NODE_ENV === 'production') {
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <div>
                        <App/>
                    </div>
                </ConnectedRouter>
            </Provider>,
            document.getElementById('venomkb_root')
        );
    } else {
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <div>
                        <App/>
                        <DevTools/>
                    </div>
                </ConnectedRouter>
            </Provider>,
            document.getElementById('venomkb_root')
        );
    }

    // if (module.hot) {
    //     module.hot.accept('./index/containers/Root', () => {
    //         const NewRoot = require('./index/containers/Root').default;
    //         render(
    //             <AppContainer>
    //                 { /* Where we enter our application! Redirects to Root.js component */ }
    //                 <NewRoot store={store} history={history} />
    //             </AppContainer>,
    //             document.getElementById('venomkb_root')
    //         );
    //     });
    // }
});
