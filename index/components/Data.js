import React from 'react';
import PropTypes from 'prop-types';
import DataVirtualized from './DataVirtualized';

class Data extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      proteins: props.proteins,
      species: props.species,
      systemiceffects: props.systemiceffects,
      index: props.index
    };
  }

  render() {
    return (
      <div>
        <h2>Search for VenomKB data</h2>
        <div id="proteins-virtualized">
          <DataVirtualized
            data={this.state.index}
            systemiceffects={this.state.systemiceffects}
          />
        </div>
      </div>
    );
  }
}

Data.propTypes = {
  proteins: PropTypes.array,
  species: PropTypes.array,
  systemiceffects: PropTypes.array,
  index: PropTypes.array,
  search: PropTypes.string
};

export default (Data);
