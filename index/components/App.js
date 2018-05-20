import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router';

import Home from './Home';
import About from './About';
import AboutFeatures from './AboutFeatures';
import AboutVenomseq from './AboutVenomseq';
import AboutOntology from './AboutOntology';
import AboutVenoms from './AboutVenoms';
import AboutApi from './AboutApi';
import Contact from './Contact';
import Publications from './Publications';
import Download from './Download';
import NotFound from './NotFound';

import DataContainer from '../containers/DataContainer';
import DataDetailContainer from '../containers/DataDetailContainer';

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

export default App;
