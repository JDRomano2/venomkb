import React from 'react';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

class DeclareField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <h3>Declare field</h3>
    );
  }
}

class AggregateField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <h3>Aggregate field</h3>
    );
  }
}

class EditableDeclareFields extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const declareFields = this.props.declareFields.map((declareField) =>(
      <DeclareField />
    ));

    return (
      <div id='declareFields'>
        {declareFields}
      </div>
    )
  }
}

class EditableAggregateFields extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const aggregateFields = this.props.aggregateFields.map((aggregateField) =>(
      <AggregateField />
    ));

    return (
      <div id='aggregateFields'>
        {aggregateFields}
      </div>
    )
  }
}

class SemanticQuery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      declareFields: [],
      aggregateFields: [],
    };
  }

  handleNewDeclareFieldClick = () => {
    const df = {
      'ontology-class': '',
      'constraints': [
        {
          'attribute': '',
          'operator': '',
          'value': ''
        }
      ],
    };
    this.setState({
      declareFields: this.state.declareFields.concat(df),
    });
  }

  handleNewAggregateFieldClick = () => {
    const af = {
      'aggregation': ''
    };
    this.setState({
      aggregateFields: this.state.aggregateFields.concat(af),
    });
  }

  render() {
    return (
      <div>
        <h2>Run a semantic API query</h2>
        <form>
          <div id='container'>
            <FormGroup
              controlId="dataSelect"
            >
              <ControlLabel>Select a data type</ControlLabel>
              <FormControl componentClass="select" placeholder="data type">
                <option value="protein">Protein</option>
                <option value="species">Species</option>
                <option value="genome">Genome</option>
              </FormControl>
            </FormGroup>

            <FormGroup
              controlId="dataDeclare"
            >
              <ControlLabel>Set filters on related data</ControlLabel>
              <div>
                <EditableDeclareFields
                  declareFields={this.state.declareFields}
                />
                <Button
                  onClick={this.handleNewDeclareFieldClick}
                >Add field</Button>
              </div>
            </FormGroup>

            <FormGroup
              controlId="dataAggregate"
            >
              <ControlLabel>Run additional functions on the results</ControlLabel>
              <EditableAggregateFields
                aggregateFields={this.state.aggregateFields}
              />
              <Button
                onClick={this.handleNewAggregateFieldClick}
              >Add field</Button>
            </FormGroup>
          </div>

          <Button type="submit">Submit query</Button>
        </form>
      </div>
    );
  }
}

export default SemanticQuery;
