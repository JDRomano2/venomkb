import React from 'react';

import { Button, ButtonToolbar } from 'react-bootstrap';

const Home = () => (
  <div>
    <div className="center jumbotron text-center">
      <img
        src="./figure_rev2_web.png"
        className="img-responsive center-block"
      />

      <h1 className="text-center">Welcome to VenomKB</h1>

      <h2>
        This is the home page for VenomKB, a centralized resource for
        discovering therapeutic uses for animal venoms and venom
        compounds
      </h2>

      <ButtonToolbar
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <Button href="/data" bsSize="large">
          Browse Data
        </Button>
        <Button href="/download" bsSize="large">
          Download
        </Button>
      </ButtonToolbar>
    </div>
    <div id="news">
      <h3>News and Updates</h3>
      <ul id="news-items">
        <li id="news-item">
          <b>April 22, 2019:</b> VenomKB now includes models for venom derived
          drugs and venom protein targets! Check out the API documentation for
          instructions on how to retrieve the data programmatically, or see one
          of the following protein data pages:
          <ul>
            <li><a href="P2161045">Omega-conotoxin MVIIA (Ziconotide)</a></li>
            <li><a href="P4997196">Bradykinin-potentiating and C-type natriuretic peptides (Captopril)</a></li>
            <li><a href="P5730495">Exendin-4 (Exenatide)</a></li>
            <li><a href="P9692848">Disintegrin barbourin (Eptifibatide)</a></li>
            <li><a href="P4081991">Thrombin-like enzyme batroxobin (Batroxobin)</a></li>
          </ul>
        </li>
        <li id="news-item">
          <b>December 30, 2018:</b> We're rolling out new data
          retrieval capabilities! For more information, check out the{' '}
          <a href="/semantic">semantic api</a> page.
        </li>
        <li id="news-item">
          <b>May 22, 2018:</b> VenomKB has undergone a major makeover
          under the hood! You can expect the site to be faster and
          more responsive. For more details, check out{' '}
          <a href="https://github.com/JDRomano2/venomkb/releases/tag/2.0.1-alpha">
            the 2.0.1-alpha release on Github
          </a>. We are currently working on major upgrades to the API;
          stay tuned!
        </li>
        <li id="news-item">
          <b>October 16, 2017:</b> We've added disease/condition
          annotations to proteins in VenomKB. Head over to{' '}
          <a href="/data">venomkb.org/data</a> to give it a try.
        </li>
        <li id="news-item">
          <b>June 25, 2017:</b> VenomKB v2.0 is live! Take a few
          minutes to check out the new features we've added.
        </li>
      </ul>
    </div>
  </div>
);

export default Home;
