import React from 'react';
import { Switch, Route } from 'react-router';

import Home from './Home';
import About from './About';
import Contact from './Contact';
import Publications from './Publications';
import Download from './Download';
import NotFound from './NotFound';
import SemanticQuery from './SemanticQuery';

import DataContainer from '../containers/DataContainer';
import DataDetailContainer from '../containers/DataDetailContainer';

const App = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/contact" component={Contact} />
    <Route path="/publications" component={Publications} />
    <Route path="/data" component={DataContainer} />
    <Route path="/download" component={Download} />
    <Route path="/semantic" component={SemanticQuery} />
    <Route path="/:index" component={DataDetailContainer} />
    <Route path="*" component={NotFound} />
  </Switch>
);

export default App;
