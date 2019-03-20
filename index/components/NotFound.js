import React from 'react';
import { Button } from 'react-bootstrap';

const NotFound = () =>
  <div>
    <h3>404 page not found</h3>
    <p>We are sorry, but the page you are looking for does not exist</p>
    <p>Click <Button bsSize="small" href="/">here</Button> to return to the home page.</p>

  </div>;

export default NotFound;
