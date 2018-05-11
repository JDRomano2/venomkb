import React, { Component } from 'react';
import PropTypes from 'prop-types';

const itisBaseUrl = 'https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=';

const getItisUrl = (tsn) => {
    return itisBaseUrl + tsn;
};

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
            <div>
                {Array(index).join(' ')}{taxon.rankName}: <a
                href={getItisUrl(taxon.itis_tsn)}
                target="_blank">
                    {taxon.taxonName}
                </a>
            </div>
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
