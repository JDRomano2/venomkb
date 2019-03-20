import React from 'react';
import PropTypes from 'prop-types';

const Protein = (props) => {
  const {
    venomkb_id,
    name
  } = props;

  return (
    <div>
      <input type="checkbox" />{ venomkb_id } { name }
    </div>
  );
};

Protein.propTypes = {
  _id: PropTypes.string,
  venomkb_id: PropTypes.string,
  name: PropTypes.string,
  outlinks: PropTypes.object
};


export default Protein;
