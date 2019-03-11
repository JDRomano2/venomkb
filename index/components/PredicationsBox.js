import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import ReactTooltip from 'react-tooltip';

// GOOD EXAMPLE OF DUPLICATES: P9587088
class PredicationsBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            predications: props.predications,
            predsDedup: this.collapseDuplicateRows(props.predications)
        };

        //this.collapseDuplicateRows = this.collapseDuplicateRows.bind(this);

    }

    collapseDuplicateRows(preds) {

        var predsDedup = []
        var seen = []

        for (var i=0; i < preds.length; i++) {
            // fetch relevant components
            const subPred = {
                s_name: preds[i].s_name,
                predicate: preds[i].predicate,
                o_name: preds[i].o_name,
                pmid: preds[i].pmid
            }
            // compose identifier
            var ident = `${subPred.s_name}${subPred.predicate}${subPred.o_name}`;

            if (predsDedup.hasOwnProperty(ident)) {
                // We've already seen this predication
                predsDedup[ident].pmid.push(subPred.pmid);
            } else {
                // We haven't seen it yet
                predsDedup[ident] = {
                    s_name: subPred.s_name,
                    predicate: subPred.predicate,
                    o_name: subPred.o_name,
                    pmid: [subPred.pmid] // HERE!
                }
            }
        }

        // Now convert it to an array:
        const predsDedupValues = Object.keys(predsDedup).map(function(k){return predsDedup[k]});
        return predsDedupValues;
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

        console.log(this.state);

        return (
            <div className="jdr-box">
                <h3 style={{'display': 'inline-block'}}>Literature predications</h3><span
                    className="glyphicon glyphicon-info-sign"
                    style={{'marginLeft': '5px'}}
                    data-tip="Go to About > Predications for more information"
                />
                <ReactTooltip />
                { !(this.state.predsDedup === undefined) &&
                <ReactTable
                    data={this.state.predsDedup}
                    columns={columns}
                    showPagination={false}
                    defaultPageSize={this.state.predsDedup.length}
                />
                }
                { (this.state.predsDedup === undefined) &&
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
