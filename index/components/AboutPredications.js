import React from 'react';
import { Alert } from 'react-bootstrap';

const AboutPredications = () =>
  <div className="jumbotron">
    <div className="container">
      <h2>About Literature Predications</h2>
      <h3>What is a predication?</h3>
      <p>
        A <i>predication</i> is a logical construct that contains two or more arguments along with a meaningful relation between those arguments. In our case, we only consider predications that have two arguments, which we name the <i>subject</i> and the <i>object</i>, respectively. The specific relationship that links the subject to the object is known as the <i>predicate</i>. Predications are not symmetrical, so the order of the subject and object is important and generally cannot be reversed without changing the meaning. An example of a predication you might find in VenomKB is:
      </p>
      <Alert variant="success" style={{'marginLeft': '75px', 'marginRight': '75px'}}>
        <p>
          Alpha-Conotoxins <tt>INHIBITS</tt> Nicotinic Receptors
        </p>
      </Alert>
      <p>
        We use predications to correspond to individual units of knowledge extracted from literature articles describing venoms and the therapeutic effects of those venoms. Using predications has several advantages, including their easy interpretability, their similarities to ontological assertions, and that they can be represented using simple data structures.
      </p>
      <p>
        A literature predication in VenomKB always corresponds to one or more literature articles that are linked to a given venomous species or venom protein, and we have filtered them for concepts that may be useful for describing translational aspects of venom effects. Some are highly descriptive (such as the one above), while others may seem less useful at first glance (e.g., "Peptides COEXISTS_WITH Venoms"). We include these, because they may be useful for certain computational approaches.
      </p>
      <p>
        In many instances, the same predication shows up many times for articles linked to a single species or protein. The raw VenomKB data (e.g., retrieved using the API or the JSON view of the website) have these stored as separate predications, but in the default view of the website, they are collapsed into a single row of a table, and the number of occurrences of that predication are listed as well.
      </p>
    </div>
  </div>;

export default AboutPredications;