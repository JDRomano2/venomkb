import React, { Component } from 'react';
import PropTypes from 'prop-types';

function processJson(unprocessed) {
  const mutableRep = unprocessed;
  delete mutableRep.json;
  delete mutableRep.isFetching;
  delete mutableRep._id;
  return mutableRep;
}

class DataJSONView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentJson: this.props.currentJSON
    };
  }

  render() {
    const processedJson = processJson(this.state.currentJson);
    const formattedJson = JSON.stringify(processedJson, null, 2);

    return(
      <div className="jumbotron">
        <pre>{formattedJson}</pre>
      </div>
    );
  }
}

DataJSONView.propTypes = {
  currentJSON: PropTypes.object.isRequired
};

export default DataJSONView;
