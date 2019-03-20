import React from 'react';
import PropTypes from 'prop-types';

import GoAnnotation from './GoAnnotation';

class GoAnnotations extends React.Component {
  render() {
    const { annotations } = this.props;

    const annotationsList = annotations.map((annot) => (
      <GoAnnotation
        key={annot.id}
        evidence={annot.evidence}
        id={annot.id}
        term={annot.term}
        project={annot.project}
      />
    ));

    return (
      <div className="annotationsContainer">
        {annotationsList}
      </div>
    );
  }
}

GoAnnotations.propTypes = {
  annotations: PropTypes.array
};

export default GoAnnotations;
