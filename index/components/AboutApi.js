import React from 'react';

const AboutApi = () =>
  <div>
    <div className="jumbotron">
      <div className="container">
        <h2>REST API Documentation</h2>
        <p>
          VenomKB comes with a public web API for programmatic access to VenomKB data. The API is simple in comparison to that of most popular scientific web databases. As of now, there are three JSON data structures you can request from the API:
        </p>
        <ul>
          <li>A single data record (a protein, species, or genome)</li>
          <li>An index of all records of a given type, or of all types</li>
          <li>A complete array of all records of a given type</li>
        </ul>
        <hr />
        <div className="hr">
        </div>
        <h2>How to use the API</h2>
        <p>
          <small>
            The API's root URL is <code>venomkb.org/api</code>.
          </small>
        </p>
        <h3>Allowed operations</h3>
        <ul>
          <li>GET <code>/dbindexitems</code>&#8212;Get an index of all records of all types in VenomKB</li>
          <li>GET <code>/proteins</code>&#8212;Get all proteins</li>
          <li>GET <code>/proteins/index</code>&#8212;Get an index of all proteins</li>
          <li>GET <code>/proteins/{'{'}venomkb_id{'}'}</code>&#8212;Get a single protein by VenomKB ID</li>
          <li>GET <code>/species</code>&#8212;Get all species</li>
          <li>GET <code>/species/index</code>&#8212;Get an index of all species</li>
          <li>GET <code>/species/{'{'}venomkb_id{'}'}</code>&#8212;Get a single species by VenomKB ID</li>
          <li>GET <code>/genomes</code>&#8212;Get all genomes</li>
          <li>GET <code>/genomes/index</code>&#8212;Get an index of all genomes</li>
          <li>GET <code>/genomes/{'{'}venomkb_id{'}'}</code>&#8212;Get a single genome by VenomKB ID</li>
        </ul>

      </div>
    </div>

    <div className="jumbotron">
      <div className="container">
        <h2>VenomKB's Semantic API</h2>
        <p>
          We are currently testing a new experimental tool that we have named the <i>Semantic API</i>. The Semantic API is designed to
        </p>
      </div>
    </div>
  </div>;


export default AboutApi;
