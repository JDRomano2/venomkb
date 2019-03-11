import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import ReactTooltip from 'react-tooltip';

// Semtypes with high translational potential:
const TRANS_STYPE_ABBRV = [
    'gngm',
    'dsyn'
];

// GOOD EXAMPLE OF DUPLICATES: P9587088
class PredicationsBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            predications: props.predications,
            processedPreds: this.processPreds(props.predications)
        };

        //this.collapseDuplicateRows = this.collapseDuplicateRows.bind(this);

    }

    processPreds(all_preds) {
        var processedPreds = this.collapseDuplicateRows(all_preds);
        //var processedPreds = this.inferClinicalRelevance(processedPreds);
        return processedPreds;
    }

    collapseDuplicateRows(preds) {
        if (preds == null) {
            return;
        }

        var predsDedup = []
        var seen = []

        for (var i=0; i < preds.length; i++) {
            // fetch relevant components
            const subPred = {
                s_name: preds[i].s_name,
                s_type: preds[i].s_type,
                predicate: preds[i].predicate,
                o_name: preds[i].o_name,
                o_type: preds[i].o_type,
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
                    s_type: subPred.s_type,
                    predicate: subPred.predicate,
                    o_name: subPred.o_name,
                    o_type: subPred.o_type,
                    pmid: [subPred.pmid] // HERE!
                }
            }
        }

        // Now convert it to an array:
        const predsDedupValues = Object.keys(predsDedup).map(function(k){return predsDedup[k]});
        return predsDedupValues;
    }

    inferClinicalRelevance(preds) {
        return preds.filter(function(pred) {
            console.log("TESTING TRANS RELEVANCE:", pred);
            var s_type_test = TRANS_STYPE_ABBRV.includes(pred.s_type);
            var o_type_test = TRANS_STYPE_ABBRV.includes(pred.o_type);
            console.log("s_type_test:", s_type_test);
            console.log("o_type_test:", o_type_test);
            s_type_test || o_type_test
        });
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
                { !(this.state.processedPreds === undefined) &&
                <ReactTable
                    data={this.state.processedPreds}
                    columns={columns}
                    showPagination={false}
                    defaultPageSize={this.state.processedPreds.length}
                />
                }
                { (this.state.processedPreds === undefined) &&
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
