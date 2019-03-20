import { List } from 'immutable';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Column, Table, SortDirection, SortIndicator, AutoSizer } from 'react-virtualized';
import Select from 'react-select';
import Slider from 'rc-slider';
import { Image } from 'react-bootstrap';
import Tooltip from 'rc-tooltip';

import 'rc-slider/assets/index.css';
import 'react-select/dist/react-select.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = (pro) => {
  const { value, dragging, index, ...restProps } = pro;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

class DataVirtualized extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      systemiceffects: props.systemiceffects,
      systemiceffectsOptions: props.systemiceffects.map((x) => {
        return {
          label: x.name,
          value: x.venomkb_id
        };
      }),
      selectedSystemicEffect: null,
      systemicEffectProteinAnnotations: null,
      filteredData: props.data,
      visibleTypes: {
        'P': true,
        'G': true,
        'S': true
      },
      disableHeader: false,
      headerHeight: 30,
      height: 800,
      col1width: 50,
      col2width: 120,
      col3width: 500,
      col4width: 120,
      col5width: 150,
      rowHeight: 45,
      rowCount: this.props.data.length,
      sortBy: 'annotation_score', // 'venomkb_id'
      sortDirection: SortDirection.ASC, // SortDirection.DESC
      useDynamicRowHeight: false,
      search: '',
      minScore: 1,
      maxScore: 5
    };

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleSystemicEffectFilterChange = this.handleSystemicEffectFilterChange.bind(this);
    this.filterData = this.filterData.bind(this);

    this._headerRenderer = this._headerRenderer.bind(this);
    this._idLinkRenderer = this._idLinkRenderer.bind(this);
    this._isSortEnabled = this._isSortEnabled.bind(this);
    this._linkButtonRenderer = this._linkButtonRenderer.bind(this);
    this._annotationScoreRenderer = this._annotationScoreRenderer.bind(this);
    this._sort = this._sort.bind(this);
  }

  _linkButtonRenderer({ cellData }) {
    if (cellData === '') {
      return <div></div>;
    }

    return (
      <div style={{ 'marginLeft': '12px' }}>
        <input
          type="checkbox"
        />
      </div>
    );
  }

  _idLinkRenderer({ cellData }) {
    return (
      <a href={cellData}>{cellData}</a>
    );
  }

  _dataTypeRenderer({ cellData }) {
    switch (cellData.charAt(0)) {
    case 'P':
      return (
        <div>Protein</div>
      );
    case 'S':
      return (
        <div>Species</div>
      );
    case 'G':
      return (
        <div>Genome</div>
      );
    default:
      return (
        <div>Unknown</div>
      );
    }
  }

  _annotationScoreRenderer({ cellData }) {
    switch (cellData) {
    case 1:
      return (
        <div>
          <Image
            style={{ 'height': '15px' }}
            src="1_star.png"
          />
        </div>
      );
    case 2:
      return (
        <div>
          <Image
            style={{ 'height': '15px' }}
            src="2_star.png"
          />
        </div>
      );
    case 3:
      return (
        <div>
          <Image
            style={{ 'height': '15px' }}
            src="3_star.png"
          />
        </div>
      );
    case 4:
      return (
        <div>
          <Image
            style={{ 'height': '15px' }}
            src="4_star.png"
          />
        </div>
      );
    case 5:
      return (
        <div>
          <Image
            style={{ 'height': '15px' }}
            src="5_star.png"
          />
        </div>
      );
    default:
      return (
        <div>Unknown</div>
      );
    }
  }

  filterData() {
    const filteredData = this.state.data.filter((entry) => {
      let typeChecked = false;
      for (const thisDataType in this.state.visibleTypes) {
        if (this.state.visibleTypes[thisDataType]) {
          if (entry.venomkb_id.charAt(0) === thisDataType) {
            typeChecked = true;
          }
        }
      }
      if (!(this.state.minScore <= entry.annotation_score && this.state.maxScore >= entry.annotation_score)) {
        typeChecked = false;
      }
      if (this.state.search === '') {
        return typeChecked;
      }
      return (entry.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1) && typeChecked;
    }, this);

    this.setState({
      filteredData: filteredData
    });
  }

  handleSliderChange(event) {
    const min = event[0];
    const max = event[1];
    this.state.minScore = min;
    this.state.maxScore = max;

    this.filterData();
  }

  handleSearchChange(event) {
    const filteredData = this.state.data.filter((entry) => {
      // Is the data type checked?
      let typeChecked = false;
      // For each data type...
      for (const thisDataType in this.state.visibleTypes) {
        // If that data type is visible...
        if (this.state.visibleTypes[thisDataType]) {
          // Set to true if current item matches the data type
          if (entry.venomkb_id.charAt(0) === thisDataType) {
            typeChecked = true;
          }
        }
      }

      if (event.target.value === '') {
        return typeChecked;
      }
      return (entry.name.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1 && typeChecked);
    }, this);

    this.setState({
      search: event.target.value,
      filteredData: filteredData
    });
  }

  handleCheckboxChange(dataType) {
    // first, toggle the checkbox
    const changedTypes = this.state.visibleTypes;
    changedTypes[dataType] = !this.state.visibleTypes[dataType];
    this.setState({ visibleTypes: changedTypes });

    // then, filter rows the same way we did in handleSearchChange
    const filteredData = this.state.data.filter((entry) => {
      let typeChecked = false;
      for (const thisDataType in this.state.visibleTypes) {
        if (this.state.visibleTypes[thisDataType]) {
          if (entry.venomkb_id.charAt(0) === thisDataType) {
            typeChecked = true;
          }
        }
      }
      if (this.state.search === '') {
        return typeChecked;
      }
      return (entry.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1) && typeChecked;
    }, this);

    this.setState({
      filteredData: filteredData
    });
  }

  handleSystemicEffectFilterChange(seValue) {
    let filteredData = this.state.data;
    if (seValue !== null) {
      const proteinAnnotations = this.state.systemiceffects.find((se) => {
        return seValue.value === se.venomkb_id;
      });
      // Modify this.state (turn off Genomes and Species, as well)
      this.setState({
        selectedSystemicEffect: seValue,
        systemicEffectProteinAnnotations: proteinAnnotations.proteins,
        visibleTypes: {
          'P': true,
          'G': false,
          'S': false
        },
      });

      filteredData = this.state.data.filter((entry) => {
        return (entry.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1) && (proteinAnnotations.proteins.includes(entry.venomkb_id));
      });
    } else {
      this.setState({
        selectedSystemicEffect: null
      });
    }

    // Do as we did above
    this.setState({
      filteredData: filteredData
    });
  }

  render() {
    const list = List(this.state.filteredData);

    const sortedList = this._isSortEnabled()
      ? list
        .sortBy(item => item[this.state.sortBy])
        .update(l =>
          this.state.sortDirection === SortDirection.ASC
            ? l.reverse()
            : l
        )
      : list;

    const rowGetter = ({ index }) => this._getDatum(sortedList, index);

    return (
      <div>
        <div id="search-bar-wrapper">

          <div id="search">
            <div id="search-control">
              <input
                className="input"
                value={this.state.search}
                onChange={this.handleSearchChange.bind(this)}
                placeholder="Filter by name..."
              />
              <div id="clear-input">
                x
              </div>
            </div>
            <div className="checkbox-list" style={{ paddingTop: '5px' }}>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  className="checkbox-control"
                  onChange={this.handleCheckboxChange.bind(this, 'S')}
                  checked={this.state.visibleTypes.S}
                />
                <span className="checkbox-label">Show species</span>
              </label>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  className="checkbox-control"
                  onChange={this.handleCheckboxChange.bind(this, 'P')}
                  checked={this.state.visibleTypes.P}
                />
                <span className="checkbox-label">Show proteins</span>
              </label>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  className="checkbox-control"
                  onChange={this.handleCheckboxChange.bind(this, 'G')}
                  checked={this.state.visibleTypes.G}
                />
                <span className="checkbox-label">Show genomes</span>
              </label>
              <label className="checkbox-inline" style={{ 'marginLeft': '20px' }}>
                <span style={{ 'width': '100px', 'pull': 'right' }}>
                  <Range
                    dots
                    step={1}
                    defaultValue={[1, 5]}
                    min={1}
                    max={5}
                    onChange={this.handleSliderChange}
                    handle={handle}
                    trackStyle={{
                      backgroundColor: '#5f666a'
                    }}
                    dotStyle={{
                      height: '5px'
                    }}
                  />
                </span>
                <span className="checkbox-label">Filter by annotation score</span>
              </label>
              <div id="num-results">{this.state.filteredData.length} results</div>
            </div>
            <div id="systemic-effect-filter">
              <Select
                placeholder="Filter by disease/phenotype association..."
                options={this.state.systemiceffectsOptions}
                onChange={this.handleSystemicEffectFilterChange}
                value={this.state.selectedSystemicEffect}
                clearable
              />
            </div>
          </div>

        </div>

        <AutoSizer disableHeight>
          {({ width }) => (
            <div>
              <Table
                ref="venomsTable"
                disableHeader={this.state.disableHeader}
                headerHeight={this.state.headerHeight}
                width={width}
                height={this.state.height}
                rowCount={this.state.filteredData.length}
                rowGetter={rowGetter}
                rowHeight={this.state.rowHeight}
                sort={this._sort}
                sortBy={this.state.sortBy}
                sortDirection={this.state.sortDirection}
              >
                <Column
                  cellRenderer={this._linkButtonRenderer}
                  width={this.state.col1width}
                  dataKey="venomkb_id"
                  headerRenderer={this._headerRenderer}
                />
                <Column
                  label="VenomKB ID"
                  dataKey="venomkb_id"
                  width={this.state.col2width}
                  headerRenderer={this._headerRenderer}
                  cellRenderer={this._idLinkRenderer}
                />
                <Column
                  label="Name"
                  dataKey="name"
                  width={this.state.col3width}
                  headerRenderer={this._headerRenderer}
                />
                <Column
                  label="Data type"
                  dataKey="venomkb_id"
                  width={this.state.col4width}
                  headerRenderer={this._headerRenderer}
                  cellRenderer={this._dataTypeRenderer}
                />
                <Column
                  label="Annotation score"
                  dataKey="annotation_score"
                  width={this.state.col5width}
                  headerRenderer={this._headerRenderer}
                  cellRenderer={this._annotationScoreRenderer}
                />
              </Table>
            </div>
          )}
        </AutoSizer>
      </div>
    );
  }

  _getDatum(list, index) {
    return list.get(index % list.size);
  }

  _sort({ sortBy, sortDirection }) {
    this.setState({ sortBy, sortDirection });
  }

  _headerRenderer({
    dataKey,
    label,
    sortBy,
    sortDirection
  }) {
    let displaySortDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
    return (
      <div>
        {label}
        {sortBy === dataKey &&
          <SortIndicator sortDirection={displaySortDirection} />
        }
      </div>
    );
  }

  _isSortEnabled() {
    return true;
  }
}

DataVirtualized.propTypes = {
  data: PropTypes.array,
  systemiceffects: PropTypes.array,
  search: PropTypes.string,
  filteredData: PropTypes.array
};

export default (DataVirtualized);
