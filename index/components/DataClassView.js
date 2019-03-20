import React from 'react';
import { Button } from 'react-bootstrap';

const DataClassView = () =>
  <div className="classView">
    <h2>Coming soon!</h2>
    <p>Check back soon to see this data record rendered in the context of Venom Ontology.</p>
    <p>In the meantime, read more about Venom Ontology on the following page:</p>
    <Button
      href="/about/ontology"
    >
      About Venom Ontology
    </Button>
  </div>;

export default DataClassView;
