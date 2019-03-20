import React from 'react';
import PropTypes from 'prop-types';

class GoAnnotation extends React.Component {
  render() {
    const {
      evidence,
      id,
      term,
      project
    } = this.props;

    const ecoLink = 'http://www.evidenceontology.org/term/' + evidence;
    const goLink = 'http://amigo.geneontology.org/amigo/term/' + id;

    return (
      <div className="annotationsContainer">
        <div className="goItem">
          <div className="goId">
            GO ID: <span style={{'float': 'right'}}>
              <a href={goLink} target="_blank">{id}</a>
            </span>
          </div>
          <div className="goTerm">
            Term: <span style={{'float': 'right'}}>
              {term}
            </span>
          </div>
          <div className="goEvidence">
            Evidence: <span style={{'float': 'right'}}>
              <a href={ecoLink} target="_blank">{evidence}</a>
            </span>
          </div>
          <div className="goProject">
            Project: <span style={{'float': 'right'}}>{project}</span>
          </div>
        </div>
      </div>
    );
  }
}

GoAnnotation.propTypes = {
  evidence: PropTypes.string,
  id: PropTypes.string.isRequired,
  term: PropTypes.string,
  project: PropTypes.string,
};

export default GoAnnotation;
