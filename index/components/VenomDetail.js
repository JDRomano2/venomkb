import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class VenomDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      venom: this.props.venom,
      proteins: this.props.venom.proteins,
      proteinsIndex: this.props.proteinsIndex
    };

    this.proteinsList = this.proteinsList.bind(this);
    this.findProteinName = this.findProteinName.bind(this);
  }

  findProteinName(protein_id) {
    const match = this.state.proteinsIndex.find((aProtein) => {
      return protein_id === aProtein.venomkb_id;
    });
    return match.name.split('(')[0];
  }

  proteinsList = () => {
    const proteins = this.props.venom.proteins;

    const proteinsListItems = proteins.map((protein, index) =>
      <li key={index}>
        <Link
          to={'/' + protein}
          onClick={() => this.props.onProteinClick(protein)}>
          {protein + ': ' + this.findProteinName(protein)}
        </Link>
      </li>
    );
    return proteinsListItems;
  }

  render() {
    const { venom } = this.state;

    return(
      <div className="jdr-box">
        <h3 style={{paddingBottom: '5px', marginTop: '5px'}}>{venom.name}</h3>
        <h4>Protein components:</h4>
        <div className="proteins-list">
          <div>
            <ul>{this.proteinsList()}</ul>
          </div>
        </div>
      </div>
    );
  }
}

VenomDetail.propTypes = {
  venom: PropTypes.object,
  onProteinClick: PropTypes.func,
  proteinsIndex: PropTypes.array
};

export default VenomDetail;
