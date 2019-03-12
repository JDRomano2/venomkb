import React from 'react';
import {
    Alert,
    Panel,
    Button,
    ButtonToolbar
} from 'react-bootstrap';
import { Route, Switch, Redirect } from 'react-router';

import { version } from '../../package.json';

import AboutFeatures from './AboutFeatures';
import AboutVenomseq from './AboutVenomseq';
import AboutOntology from './AboutOntology';
import AboutVenoms from './AboutVenoms';
import AboutApi from './AboutApi';
import AboutPredications from './AboutPredications';

const AboutVenomKB = () =>
    <div className="jumbotron">
        <div className="container">
            <h2>About VenomKB</h2>

            <Panel bsStyle="primary">
                <Panel.Body><h4>Current version: {version}</h4></Panel.Body>
            </Panel>

            <p>
                Venoms&#8212;one of the most common and iconic classes of animal toxins&#8212;have been used for various therapeutic purposes since the dawn of recorded history. They are complex mixtures of proteins, carbohydrates, steroids, and inorganic cofactors, many of which have complex and highly specialized mechanisms of action when introduced to animal tissue. Recently, science has found a number of ways these mechanisms of action can be exploited for purposes beneficial to human health.
            </p>

            <p>
                VenomKB was designed to address the fact that these discoveries are not collected in any single location, as well as the belief that the vast majority of therapeutic uses for venom components have yet to be discovered. For more information regarding our motivation designing VenomKB, please check out the following page:
            </p>
            <Button href="/about/whyvenoms">Why Venoms?</Button>

            <h3>Technical information</h3>
            <p><small>
                    The current version of VenomKB is a web application that runs on NodeJS, with a front-end written in AngularJS and ReactJS. The data model for all VenomKB database records runs on MongoDB. All of the code for the VenomKB website can be found on GitHub, at <a href="https://github.com/JDRomano2/venomkb_new.git">JDRomano2/venomkb_new</a>. All of our code is released under the <a href="./public/files/LICENSE.txt">GNU GPLv3 License</a>, which means you have the right to reuse and modify the code for both personal and commercial use, but you must disclose the original source and maintain the same license agreement, and that VenomKB and the data contained within it come without any warranty or any assumption of liability.
            </small></p>

            <h3>Citing VenomKB</h3>
            <p>
                Until a paper describing VenomKB v2.0 is published, please use the following citation for VenomKB v1.0:
            </p>
            <Alert bsStyle="success">
                Romano JD, Tatonetti NP; VenomKB - A new knowledge base for facilitating the validation of putative venom therapies. <i>Scientific Data</i> <b>2</b>(65) 2015.
            </Alert>
        </div>
    </div>;

const About = ({ match }) => (
    <div>
        <div className="jumbotron">
            <h2>Select a topic to learn more</h2>

            <ButtonToolbar style={{display: 'flex', justifyContent: 'center'}} size="sm">
                <Button href="./venomkb">About VenomKB</Button>
                <Button href="./features">Feature Map</Button>
                <Button href="./venomseq">VenomSeq</Button>
                <Button href="./whyvenoms">Why Venoms?</Button>
                <Button href="./ontology">Venom Ontology</Button>
                <Button href="./api">API</Button>
                <Button href="./predications">Predications</Button>
            </ButtonToolbar>
        </div>

        <Switch>
            <Route path={`${match.url}/venomkb`} component={AboutVenomKB}/>
            <Route path={`${match.url}/features`} component={AboutFeatures}/>
            <Route path={`${match.url}/venomseq`} component={AboutVenomseq}/>
            <Route path={`${match.url}/ontology`} component={AboutOntology}/>
            <Route path={`${match.url}/whyvenoms`} component={AboutVenoms}/>
            <Route path={`${match.url}/api`} component={AboutApi}/>
            <Route path={`${match.url}/predications`} component={AboutPredications}/>
            <Redirect exact from='/' to={`${match.url}/venomkb`}/>
        </Switch>
    </div>
)


export default About;
