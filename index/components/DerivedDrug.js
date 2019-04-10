import React from 'react';

class DerivedDrug extends React.Component {
  constructor(props) {
    super(props);

    const outLinks = [
      {
        'database_or_taxonomy': 'Drugbank',
        'identifier': 'DB01276'
      },
      {
        'database_or_taxonomy': 'ATC',
        'identifier': 'A10BJ01'
      },
      {
        'database_or_taxonomy': 'RxNorm',
        'identifier': '60548'
      }
    ];

    var atcLink = outLinks.find(function(link) {
      return link['database_or_taxonomy'] === 'ATC';
    });
    let drugbankLink = outLinks.find(function(link) {
      return link['database_or_taxonomy'] === 'Drugbank';
    });
    let rxnormLink = outLinks.find(function(link) {
      return link['database_or_taxonomy'] === 'RxNorm';
    });

    this.state = {
      drugName: 'Exenatide',
      brandNames: ['Bydureon', 'Byetta'],
      description: 'Exenatide is a medication used to treat type-2 diabetes mellitus, isolated from the saliva of the Gila monster (heloderma suspectum). It is a GLP-1 receptor agonist. It is currently being studied for efficacy in treating the symptoms of Parkinson\'s disease.',
      atcLink: atcLink,
      drugbankLink: drugbankLink,
      rxnormLink: rxnormLink,
    };
  }

  render() {
    const atcUrl = `https://www.whocc.no/atc_ddd_index/?code=${this.state.atcLink['identifier']}&showdescription=yes`;
    const drugbankUrl = `https://www.drugbank.ca/drugs/${this.state.drugbankLink['identifier']}`;
    const rxnormUrl = `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${this.state.rxnormLink['identifier']}`;

    return (
      <div id='drug-box'>
        <h4>Drug name: {this.state.drugName}</h4>
        <p>
          {this.state.description}
        </p>
        <p>
          ATC code: <a href={atcUrl} target='_blank'>{this.state.atcLink['identifier']}</a>
        </p>
        <p>
          Drugbank ID: <a href={drugbankUrl} target='_blank'>{this.state.drugbankLink['identifier']}</a>
        </p>
        <p>
          RxNorm RXCUI: <a href={rxnormUrl} target='_blank'>{this.state.rxnormLink['identifier']}</a>
        </p>
      </div>
    );
  }
}

export default DerivedDrug;
