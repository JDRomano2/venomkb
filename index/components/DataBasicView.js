import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SequenceBox from '../components/SequenceBox';
import OutLinks from '../components/OutLinks';
import { connect } from 'react-redux';
import { selectData, fetchData } from '../actions';
import ReactTooltip from 'react-tooltip';

import VenomDetail from '../components/VenomDetail.js';
import TaxonomyDetail from '../components/TaxonomyDetail.js';
import ProteinImage from '../components/ProteinImage.js';
import SpeciesImage from '../components/SpeciesImage.js';
import PredicationsBox from '../components/PredicationsBox';
import LiteratureRefs from '../components/LiteratureRefs';
import GoAnnotations from '../components/GoAnnotations';
import DerivedDrugs from '../components/DerivedDrugs';
import Targets from './TargetActions';

class DataBasicView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataType: props.dataType,
      currentData: props.currentData
    };

    this.loadSpeciesFromProtein = this.loadSpeciesFromProtein.bind(this);
    this.getAnnotationScoreFilename = this.getAnnotationScoreFilename.bind(this);
  }

  speciesName(query_vkbid) {
    const foundSpecies = this.props.species.find((element) => {
      return element.venomkb_id === query_vkbid;
    });
    return foundSpecies.name;
  }

  loadSpeciesFromProtein() {
    const { venom_ref } = this.props;
    this.props.dispatch(selectData(venom_ref.replace('V', 'S')));
    this.props.dispatch(fetchData(venom_ref.replace('V', 'S')));
  }

  loadSpeciesFromGenome(e) {
    this.props.dispatch(selectData(e));
    this.props.dispatch(selectData(e));
  }

  loadProteinFromSpecies(e) {
    this.props.dispatch(selectData(e));
    this.props.dispatch(fetchData(e));
  }

  getAnnotationScoreFilename() {
    switch (this.state.currentData.annotation_score) {
    case 1:
      return '/1_star.png';
    case 2:
      return '/2_star.png';
    case 3:
      return '/3_star.png';
    case 4:
      return '/4_star.png';
    case 5:
      return '/5_star.png';
    default:
      return 'error';
    }
  }

  render() {
    const {
      selectedDatum,
      name,
      out_links,
      aa_sequence,
      description,
      venom_ref,
      venom,
      taxonomic_lineage,
      pdb_image_url,
      pdb_structure_known,
      species_image_url,
      refs,
      predications,
      go_annotations,
      venom_proteins,
      drugs,
      target_actions,
    } = this.props;

    //const targets = [];

    console.log('TARGETS: ', target_actions);

    const common_name = this.props.common_name;
    const dataType = this.props.selectedDatum.charAt(0);

    if (dataType === 'S') {
      // We need to aggregate literature predications for all proteins
      var species_predications = [];
      for (var i=0; i < venom_proteins.length; i++) {
        species_predications = species_predications.concat(venom_proteins[i].literature_predications);
      }
    }

    switch (dataType) {
    case 'P': {
      const species_link = '/' + (venom_ref.replace('V', 'S'));

      return (
        <div>
          <Col xs={12} md={9} style={{'marginBottom': '50px'}}>
            <h1>{name}</h1>
            Annotation score: <img
              src={this.getAnnotationScoreFilename()}
              style={{
                'height': '15px',
                'position': 'relative',
                'top': '-3px',
                'marginRight': '3px'
              }}
            /><span
              className="glyphicon glyphicon-info-sign"
              data-tip="1-5 scale - represents the completeness of this data item"
            />
            <ReactTooltip />
            <h3>ID: {selectedDatum}</h3>
            <h4>
              Organism: <Link to={species_link} onClick={this.loadSpeciesFromProtein}>({this.speciesName(venom_ref.replace('V', 'S'))}) ({venom_ref.replace('V', 'S')})</Link>
            </h4>
            <p>
              {description}
            </p>
          </Col>

          <Col xs={6} md={3}>
            <ProteinImage
              pdb_image_url={pdb_image_url}
              structure_known={pdb_structure_known}
            />
          </Col>

          {!(name === undefined) &&
          <div>
            <Col xs={12} md={12}>
              <SequenceBox
                aaSequence={aa_sequence}
                fastaLabel={selectedDatum + ': ' + name + ' (' + this.speciesName(venom_ref.replace('V', 'S')) + ')'}
              />
            </Col>

            {!(drugs === undefined || drugs.length == 0) &&
            <Col xs={12} md={12}>
              <div className="derivedDrugs">
                <h3>Derived Drugs</h3>
                <DerivedDrugs
                  drugs={drugs}
                />
              </div>
            </Col>
            }

            {/* {!(targets === undefined || targets.length == 0) && */}
            {!(target_actions.length == 0) &&
            <Col xs={12} md={12}>
              <div className="targets">
                <h3>Protein targets</h3>
                <Targets
                  target_actions={target_actions}
                />
              </div>
            </Col>
            }

            <Col xs={12} md={12}>
              <div className="goAnnotations">
                <h3>Gene Ontology annotations</h3>
                <GoAnnotations
                  annotations={go_annotations}
                />
              </div>
            </Col>

            {!(refs === []) &&
            <Col xs={12} md={12}>
              <div className="literatureRefs">
                <h3>Related publications</h3>
                <LiteratureRefs
                  refs={refs}
                />
              </div>
            </Col>
            }

            <Col xs={12} md={12}>
              <PredicationsBox
                predications={predications}
              />
            </Col>

            <div
              style={{'marginTop': '12px'}}
            />

            <Col xs={12} md={12}>
              <h3>External database identifiers</h3>
              <OutLinks links={out_links} />
            </Col>
          </div>
          }
        </div>
      );
    }
    case 'S': {
      return (
        <div style={{'marginTop': '10px'}}>
          <Col xs={12} md={7}>
            <h1>{name}</h1>
            Annotation score: <img
              src={'/5_star.png'}
              style={{
                'height': '15px',
                'position': 'relative',
                'top': '-3px',
                'marginRight': '3px'
              }}
            /><span
              className="glyphicon glyphicon-info-sign"
              data-tip="1-5 scale - represents the completeness of this data item"
            />
            <h3>ID: {selectedDatum}</h3>
            <h4>Common name: {common_name}</h4>

            <h3>Taxonomy</h3>
            {(taxonomic_lineage !== undefined) &&
              <TaxonomyDetail
                taxonomic_lineage={taxonomic_lineage}
              />
            }
            {(taxonomic_lineage === undefined) &&
              <div>
                No data available!
              </div>
            }
          </Col>

          <Col xs={6} md={5}>
            <SpeciesImage
              species_image_url={species_image_url}
            />
          </Col>

          <Col xs={12} md={12}>
            <VenomDetail
              venom={venom}
              onProteinClick={this.loadProteinFromSpecies.bind(this)}
              proteinsIndex={this.props.proteins}
            />
          </Col>

          <Col xs={12} md={12}>
            <PredicationsBox
              predications={species_predications}
            />
          </Col>

        </div>
      );
    }
    case 'G': {
      const species_link_g = '/' + (this.state.currentData.species_ref);
      const species_known = ( (species_link_g==='/') ? false : true );

      return (
        <div>
          <Col xs={12} md={7}>
            <h1>{name}</h1>
            Annotation score: <img
              src={'/5_star.png'}
              style={{
                'height': '15px',
                'position': 'relative',
                'top': '-3px',
                'marginRight': '3px'
              }}
            /><span
              className="glyphicon glyphicon-info-sign"
              data-tip="1-5 scale - represents the completeness of this data item"
            />
            <h3>ID: {selectedDatum}</h3>

            <h2>Project homepage</h2>
            <a href={this.state.currentData.project_homepage}>
              {this.state.currentData.project_homepage}
            </a>

            <h2>Species</h2>
            {species_known ? (
              <h4>
              Organism: <Link to={species_link_g} onClick={this.loadSpeciesFromGenome}>({this.speciesName(this.state.currentData.species_ref)}) ({this.state.currentData.species_ref})</Link>
              </h4>
            ) : (
              <i>
              This species is not yet indexed in VenomKB!
              If you would like us to add it, please send an email to <a href="mailto:jdr2160@cumc.columbia.edu">the developers</a>.
              </i>
            )}
          </Col>
        </div>
      );
    }
    case 'Q': {
      return (
        <div>
          <Col xs={12} md={7}>
            <h1>{name}</h1>
          </Col>
        </div>
      );
    }
    default: {
      return (
        <div>
          ERROR! Invalid data type.
        </div>
      );
    }
    }
  }
}

DataBasicView.propTypes = {
  selectedDatum: PropTypes.string.isRequired,
  common_name: PropTypes.string,
  dataType: PropTypes.string.isRequired,
  description: PropTypes.string,
  out_links: PropTypes.array,
  name: PropTypes.string.isRequired,
  aa_sequence: PropTypes.string,
  venom_ref: PropTypes.string,
  venom: PropTypes.object,
  taxonomic_lineage: PropTypes.array,
  species: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  pdb_image_url: PropTypes.string,
  pdb_structure_known: PropTypes.bool,
  species_image_url: PropTypes.string,
  refs: PropTypes.array,
  predications: PropTypes.array,
  go_annotations: PropTypes.array,
  proteins: PropTypes.array,
  currentData: PropTypes.object,
  venom_proteins: PropTypes.array,
  drugs: PropTypes.array,
  targets: PropTypes.array
};

const mapStateToProps = (state) => {
  const { selectedData, currentData } = state.inMemory;
  const { proteins } = state.resources;
  return {
    selectedData,
    currentData,
    proteins
  };
};

export default connect(mapStateToProps)(DataBasicView);
