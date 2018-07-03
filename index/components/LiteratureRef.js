import React from 'react';
import PropTypes from 'prop-types';

class LiteratureRef extends React.Component {
    render() {
        const {
            pmid,
            journalName,
            title,
            firstAuthor
        } = this.props;

        return (
            <div className="litRefItem">
                <div className="literaturePmid">
                    PMID: <a href={'http://ncbi.nlm.nih.gov/pubmed/' + pmid}>{pmid}</a>
                </div>
                <div className="literatureTitle">
                    Title: {title}
                </div>
                <div className="firstAuthorName">
                    First Author: {firstAuthor}
                </div>
                <div className="literatureJournalName">
                    Journal: {journalName}
                </div>
            </div>
        );
    }
}

LiteratureRef.propTypes = {
    pmid: PropTypes.number,
    firstAuthor: PropTypes.string,
    journalName: PropTypes.string,
    title: PropTypes.string
};

export default LiteratureRef;
