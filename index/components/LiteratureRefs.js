import React from 'react';
import PropTypes from 'prop-types';

import LiteratureRef from './LiteratureRef';

class LiteratureRefs extends React.Component {
    render() {
        const { refs } = this.props;

        const refsList = refs.map((ref) => (
            <LiteratureRef
                key={ref.pmid}
                pmid={ref.pmid}
                journalName={ref.journal_name}
                firstAuthor={ref.first_author}
                title={ref.title}
            />
        ));

        return (
            <div>
                {refsList}
            </div>
        );
    }
}

LiteratureRefs.propTypes = {
    refs: PropTypes.array
};

export default LiteratureRefs;
