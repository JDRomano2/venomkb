import React from 'react';
import ReactTable from 'react-table';
import { Media } from 'react-bootstrap';

const modeOfAction = 'Inhibition';

class TargetAction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      target: this.props.targetAction,
      modeOfAction: modeOfAction,
    };
  }

  render() {
    const pdb_structure = ['http://www.rcsb.org/structure/',this.state.target.pdb_structure].join('');

    const columns = [{
      Header: 'Disease or condition',
      accessor: 'name'
    }, {
      Header: 'UMLS CUI',
      accessor: 'umls_cui',
      width: 175
    }];

    return (
      <div id='target-box'>
        <Media>
          <Media.Body>
            <Media.Heading>Target: {this.state.target.target_name}</Media.Heading>
            <p>
            Synonyms: {this.state.target.target_synonyms.join(', ')} &emsp; Target gene(s): {this.state.target.target_genes.join(', ')}
            </p>
            <p>
              {this.state.target.target_description}
            </p>

            <p>
              Venom protein's mode of action: {this.state.modeOfAction}
            </p>

            <h4>Implicated diseases:</h4>
            <div id='target-disease-table'>
              <center>
                <ReactTable
                  data={this.state.target.diseases_and_conditions}
                  columns={columns}
                  showPagination={false}
                  defaultPageSize={this.state.target.diseases_and_conditions.length}
                />
              </center>
            </div>
          </Media.Body>

          <Media.Right>
            <img src={this.state.target.image_url} height={240}/>
            <div>
              <center>
                <small><i>Source: <a href={pdb_structure} target='_blank'>PDB</a></i></small>
              </center>
            </div>
          </Media.Right>
        </Media>
      </div>
    );
  }
}

export default TargetAction;
