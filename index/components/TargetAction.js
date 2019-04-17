import React from 'react';
import ReactTable from 'react-table';
import { Media } from 'react-bootstrap';

const exampleTarget = {
  protein_refs: ['P5730495'],
  target_name: 'Glucagon-like peptide 1 receptor',
  target_synonyms: [
    'GLP-1 receptor',
    'GLP-1R'
  ],
  target_description: 'Receptor protein found on cells in the pancreas, responsible for enhancing levels of glucose secreted into the blood. GLP1R is a G protein-coupled receptor, consisting of 1 extracellular and one transmembrane domain. Endogenous activators of the receptor in humans include GLP-1 and glucagon.',
  target_genes: [
    'GLP1R'
  ],
  pdb_structure: '5VEX',
  image_url: 'https://cdn.rcsb.org/images/rutgers/ve/5vex/5vex.pdb1-500.jpg',
  diseases_and_conditions: [
    {
      name: 'Diabetes Mellitus, Non-Insulin-Dependent',
      umls_cui: 'C0011860'
    },
    {
      name: 'Irritable Bowel Syndrome',
      umls_cui: 'C0022104'
    }
  ]
};

const modeOfAction = 'Inhibition';

class TargetAction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      target: exampleTarget,
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
