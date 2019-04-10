import React from 'react';

import DerivedDrug from '../components/DerivedDrug.js';

class DerivedDrugs extends React.Component {
  constructor(props) {
    super(props);

    this.setState = {
      derivedDrugs: [
        'Drug1',
        'Drug2',
        'Drug3'
      ]
    };
  }

  render() {
    return (
      <div>
        <DerivedDrug
          drugName={'Drug1'}
        />
      </div>
    );
  }
}

export default DerivedDrugs;
