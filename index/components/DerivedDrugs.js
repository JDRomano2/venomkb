import React from 'react';

import DerivedDrug from '../components/DerivedDrug.js';

class DerivedDrugs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drugs: this.props.drugs
    };
  }

  render() {
    //TODO: Make it able to render an array of drugs instead of just one
    return (
      <div>
        <DerivedDrug
          drug={this.state.drugs[0]}
        />
      </div>
    );
  }
}

export default DerivedDrugs;
