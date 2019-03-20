import React from 'react';

const Publications = () =>
  <div className="jumbotron">
    <h2>Publications</h2>
    <p><small><i>VenomKB is completely open-source and free to use. Please cite one of the following papers if you use or modify VenomKB for research purposes:</i></small></p>
    <div className="publicationsList">
      <p>
        1. Romano JD, Tatonetti NP. VenomKB - A new knowledge base for facilitating the validation of putative venom therapies. <i>Scientific Data</i> <b>2</b>(65) 2015.
      </p>
      <p>
        2. Romano JD, Tatonetti NP. Using a Novel Ontology to Inform the Discovery of Therapeutic Peptides from Animal Venoms. <i>AMIA Jt Summits Transl Sci Proc.</i> <b>2016</b>:209-18 2016.
      </p>
      <p>
        3. Romano JD, Nwankwo V, Tatonetti NP. VenomKB v2.0 - A comprehensive knowledge repository for computational toxinology. <i>(In preparation)</i> 2017.
      </p>
    </div>
  </div>;


export default Publications;
