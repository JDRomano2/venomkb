import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from '../components/App';
import Home from '../components/Home';
import About from '../components/About';
import AboutFeatures from '../components/AboutFeatures';
import AboutVenomseq from '../components/AboutVenomseq';
import AboutOntology from '../components/AboutOntology';
import AboutVenoms from '../components/AboutVenoms';
import AboutApi from '../components/AboutApi';
import Contact from '../components/Contact';
import Publications from '../components/Publications';
import Download from '../components/Download';
import NotFound from '../components/NotFound';

import DataContainer from '../containers/DataContainer';
import DataDetailContainer from '../containers/DataDetailContainer';


export default (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
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
    </Route>
);
