import React from 'react';
import { ButtonToolbar, Button, Media } from 'react-bootstrap';

class DerivedDrug extends React.Component {
  constructor(props) {
    super(props);

    const outLinks = this.props.drug.out_links;

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
      drugName: this.props.drug.name,
      brandNames: this.props.drug.brand_names,
      description: this.props.drug.description,
      molecularWeight: this.props.drug.molecular_weight,
      atcLink: atcLink,
      drugbankLink: drugbankLink,
      rxnormLink: rxnormLink,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Exenatide.svg/175px-Exenatide.svg.png',
    };
  }

  render() {
    const atcUrl = `https://www.whocc.no/atc_ddd_index/?code=${this.state.atcLink['identifier']}&showdescription=yes`;
    const drugbankUrl = `https://www.drugbank.ca/drugs/${this.state.drugbankLink['identifier']}`;
    const rxnormUrl = `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${this.state.rxnormLink['identifier']}`;

    return (
      <div id='drug-box'>
        <Media>
          <Media.Body>
            <Media.Heading>Drug name: {this.state.drugName}</Media.Heading>
            <p>
              Synonyms and brands: {this.state.brandNames.join(', ')} &emsp; Molecular weight: {this.state.molecularWeight}
            </p>
            <p>
              {this.state.description}
            </p>

            <ButtonToolbar className='drug-button-toolbar'>
              <Button
                href={atcUrl}
                target='_blank'
                bsStyle='primary'>
                  ATC code: {this.state.atcLink['identifier']}
              </Button>
              <Button
                href={drugbankUrl}
                target='_blank'
                bsStyle='primary'>
                  Drugbank ID: {this.state.drugbankLink['identifier']}
              </Button>
              <Button
                href={rxnormUrl}
                target='_blank'
                bsStyle='primary'>
                  RxNorm RXCUI: {this.state.rxnormLink['identifier']}
              </Button>
            </ButtonToolbar>
          </Media.Body>

          <Media.Right>
            <img src={this.state.image_url} width={175} height={240}/>
          </Media.Right>
        </Media>


      </div>
    );
  }
}

export default DerivedDrug;
