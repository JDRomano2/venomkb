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
      image_url: this.props.drug.image_url,
    };
  }

  render() {
    var rxnormFlag = true;
    var rxnormUrl = ''

    const atcUrl = `https://www.whocc.no/atc_ddd_index/?code=${this.state.atcLink['identifier']}&showdescription=yes`;
    const drugbankUrl = `https://www.drugbank.ca/drugs/${this.state.drugbankLink['identifier']}`;
    try {
      rxnormUrl = `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${this.state.rxnormLink['identifier']}`;
    } catch(err) {
      rxnormFlag = false;
    }

    console.log(this.state.image_url);

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
              {rxnormFlag &&
                <Button
                  href={rxnormUrl}
                  target='_blank'
                  bsStyle='primary'>
                    RxNorm RXCUI: {this.state.rxnormLink['identifier']}
                </Button>
              }
            </ButtonToolbar>
          </Media.Body>

          <Media.Right>
            {!(this.state.image_url === undefined) ? (
              <img src={this.state.image_url} width={200} height={240}/>
            ) : (
              <div style={{ 'width': 200, 'height': 240, 'text-align': 'center'}}>
                <i>No image available</i>
              </div>
            )
            }
          </Media.Right>
        </Media>


      </div>
    );
  }
}

export default DerivedDrug;
