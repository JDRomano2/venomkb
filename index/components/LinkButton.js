import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class LinkButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      linkedId: props.linkedId,
    };
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        <Link
          style={{display: 'block', height: '100%'}}
          to={`/${this.state.linkedId}`}
        >
          View
        </Link>
      </button>
    );
  }
}

LinkButton.propTypes = {
  selectedData: PropTypes.string.isRequired,
  json: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  linkedId: PropTypes.string
};

const mapStateToProps = (state) => {
  const { selectedData, currentProtein } = state.inMemory;
  const {
    isFetching,
    lastUpdated,
    json
  } = currentProtein || {
    isFetching: true,
    json: {}
  };

  return {
    selectedData,
    json,
    isFetching,
    lastUpdated
  };
};

export default connect(mapStateToProps)(LinkButton);
