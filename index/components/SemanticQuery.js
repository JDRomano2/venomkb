import React from 'react';
import {
  Button,
  Form,
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
      <div id='declare-box'>
        <FormGroup controlId="testing">
          <ControlLabel>Ontology class</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="Choose an ontology class"
          >
            <option value="protein">Protein</option>
            <option value="species">Species</option>
            <option value="genome">Genome</option>
            <option value="systemiceffect">SystemicEffect</option>
            <option value="pfam">ProteinFamily</option>
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Filter</ControlLabel>
          <Form componentClass="fieldset" inline>
            <FormControl
              type="text"
              placeholder="Enter attribute"
              style={{width: '35%'}}
            />
            <FormControl
              componentClass="select"
              placeholder="Select an operator"
              style={{width: '15%'}}
            >
              <option value="equals">equals</option>
              <option value="contains">contains</option>
            </FormControl>
            <FormControl
              type="text"
              placeholder="Enter a value"
              style={{width: '50%'}}
            />
          </Form>
        </FormGroup>
      </div>
    );
  }
}

class AggregateField extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id='aggregate-box'>
        <FormGroup>
          <ControlLabel>Aggregation function</ControlLabel>
          <FormControl componentClass="select">
            <option value="distinct">distinct</option>
            <option value="count">count</option>
            <option value="sort">sort</option>
            <option value="exists">exists</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Apply to:</ControlLabel>
          <Form componentClass="fieldset" inline>
            <FormControl
              componentClass="select"
              placeholder="Class"
              style={{width: '40%'}}
            >
              <option value="protein">Protein</option>
              <option value="species">Species</option>
              <option value="genome">Genome</option>
              <option value="systemiceffect">SystemicEffect</option>
              <option value="pfam">ProteinFamily</option>
            </FormControl>
            <FormControl
              type="text"
              placeholder="Attribute (optional)"
              style={{width: '60%'}}
            />
          </Form>
        </FormGroup>
      </div>
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

  handleDeleteDeclareFieldClick = () => {
    const dfs = this.state.declareFields;
    dfs.pop();
    this.setState({
      declareFields: dfs,
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

  handleDeleteAggregateFieldClick = () => {
    const afs = this.state.aggregateFields;
    afs.pop();
    this.setState({
      aggregateFields: afs,
    });
  }

  render() {
    return (
      <div className='jumbotron'>
        <div className='container'>
          <h2>Submit a Semantic API query</h2>
          <p style={{'fontSize': '11pt'}}>
            For an explanation of the different fields and what they mean, see the documentation: <Button bsSize="xsmall" href="about/api">Semantic API Documentation</Button>
          </p>
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
                  <option value="systemiceffect">SystemicEffect</option>
                  <option value="pfam">ProteinFamily</option>
                </FormControl>
              </FormGroup>

              <div className="hr"/>

              <FormGroup
                controlId="dataDeclare"
              >
                <ControlLabel>Apply filters to related data types</ControlLabel>
                <div>
                  <EditableDeclareFields
                    declareFields={this.state.declareFields}
                  />
                  <Button
                    onClick={this.handleNewDeclareFieldClick}
                  >Add field</Button>
                  {this.state.declareFields.length > 0 &&
                    <Button
                      onClick={this.handleDeleteDeclareFieldClick}
                      bsStyle="danger"
                    >Delete field</Button>
                  }
                </div>
              </FormGroup>

              <div className="hr"/>

              <FormGroup
                controlId="dataAggregate"
              >
                <ControlLabel>Run additional functions on the results (optional)</ControlLabel>
                <EditableAggregateFields
                  aggregateFields={this.state.aggregateFields}
                />
                <Button
                  onClick={this.handleNewAggregateFieldClick}
                >Add field</Button>
                {this.state.aggregateFields.length > 0 &&
                  <Button
                    onClick={this.handleDeleteAggregateFieldClick}
                    bsStyle="danger"
                  >Delete field</Button>
                }
              </FormGroup>
            </div>

            <Button type="submit" bsSize="large">Submit query</Button>
          </form>
        </div>
      </div>
    );
  }
}

export default SemanticQuery;
