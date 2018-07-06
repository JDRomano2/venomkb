import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import ReactTooltip from 'react-tooltip';

class PredicationsBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const columns = [{
            Header: 'Subject',
            accessor: 's_name'
        }, {
            Header: 'Predicate',
            accessor: 'predicate'
        }, {
            Header: 'Object',
            accessor: 'o_name'
        }, {
            Header: 'PubMed ID',
            accessor: 'pmid'
        }];

        return (
            <div className="jdr-box">
                <h3 style={{'display': 'inline-block'}}>Literature predications</h3><span
                    className="glyphicon glyphicon-info-sign"
                    style={{'marginLeft': '5px'}}
                    data-tip="Go to About > Predications for more information"
                />
                <ReactTooltip />
                { !(this.props.predications === undefined) &&
                <ReactTable
                    data={this.props.predications}
                    columns={columns}
                    showPagination={false}
                    defaultPageSize={this.props.predications.length}
                />
                }
                { (this.props.predications === undefined) &&
                <div>
                    No predications present in VenomKB for this record.
                </div>
                }
            </div>
        );
    }
}

PredicationsBox.propTypes = {
    predications: PropTypes.array
};

export default PredicationsBox;
