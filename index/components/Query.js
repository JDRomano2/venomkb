import React from 'react';

import { Button } from 'react-bootstrap';

class Query extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectValue: ''
    };

    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeSelect(event) {
    this.setState({
      selectValue: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <div>
          <h2>Semantic API query builder</h2>
        </div>

        <div>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <label style={{display: 'block'}}>
              Desired data type:
              <select value={this.state.selectValue} onChange={this.handleChangeSelect}>
                <option value="protein">Protein</option>
                <option value="species">Species</option>
                <option value="genome">Genome</option>
                <option value="systemicEffect">Systemic Effect</option>
                <option value="venomSeq">VenomSeq data</option>
              </select>
            </label>
            <label style={{display: 'block'}}>
              Filters:
              <div>
                <label>
                  Data type:
                  <select value={this.state.selectValue} onChange={this.handleChangeSelect}>
                    <option value="protein">Protein</option>
                    <option value="species">Species</option>
                    <option value="genome">Genome</option>
                    <option value="systemicEffect">Systemic Effect</option>
                    <option value="venomSeq">VenomSeq data</option>
                  </select>
                </label>
                <Button bsSize="medium">+</Button>
              </div>
            </label>
            <input type="submit" value="Submit"/>
          </form>
        </div>
      </div>
    );
  }
}

export default(Query);
