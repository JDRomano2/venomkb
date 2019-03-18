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
