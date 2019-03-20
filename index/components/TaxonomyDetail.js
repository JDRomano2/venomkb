import React, { Component } from 'react';
import PropTypes from 'prop-types';

const itisBaseUrl = 'https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=';

const getItisUrl = (tsn) => {
  return itisBaseUrl + tsn;
};

class LineageItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      taxon: props.taxon,
      index: props.index,
    };
  }

  render() {
    const {
      taxon,
      index,
    } = this.state;

    return (
      <div>
        {Array(index).join(' ')}{taxon.rankName}: <a
          href={getItisUrl(taxon.itis_tsn)}
          target="_blank">
          {taxon.taxonName}
        </a>
      </div>
    );
  }
}

class TaxonomyDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      taxonomic_lineage: props.taxonomic_lineage
    };

    this.hierarchyList = this.hierarchyList.bind(this);
  }


  hierarchyList = () => {
    const lineage = this.props.taxonomic_lineage;
    const lineageItems = lineage.map((taxon, index) =>
      <LineageItem taxon={taxon} index={index} key={index} />
    );
    return lineageItems;
  }

  render() {
    return (
      <div>
        <pre className="taxonomy-detail">
          {this.hierarchyList()}
        </pre>
      </div>
    );
  }
}

TaxonomyDetail.propTypes = {
  taxonomic_lineage: PropTypes.array
};

export default TaxonomyDetail;
