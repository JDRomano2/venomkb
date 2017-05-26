import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import SequenceBox from '../components/SequenceBox';
import OutLinks from '../components/OutLinks';
import { connect } from 'react-redux';
import { selectData, fetchData } from '../actions';

class DataBasicView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataType: props.dataType
        };

        this.loadSpeciesFromProtein = this.loadSpeciesFromProtein.bind(this);
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

    render() {
        const {
            selectedDatum,
            name,
            out_links,
            aa_sequence,
            description,
            venom_ref,
        } = this.props;

        const common_name = this.props.common_name;
        console.log('Common name: ', common_name);

        console.log('Data type:', this.state.dataType);
        const dataType = this.props.selectedDatum.charAt(0);
        console.log('Data type (props): ', dataType);

        switch (dataType) {
            case 'P':
                const species_link = '/' + (venom_ref.replace('V', 'S'));

                return (
                    <div>
                        <Col xs={12} md={12}>
                            <Image className="pull-right" src={"http://www.rcsb.org/pdb/images/5MIM_bio_r_250.jpg"} thumbnail />
                            <h1>{name}</h1>
                            <h3>ID: {selectedDatum}</h3>
                            <h4>
                                Organism: <Link to={species_link} onClick={this.loadSpeciesFromProtein}>({this.speciesName(venom_ref.replace('V', 'S'))}) ({venom_ref.replace('V', 'S')})</Link>
                            </h4>
                            <p>
                                {description}
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                        </Col>

                        {!(name === undefined) &&
                        <div>
                            <Col xs={12} md={12}>
                                <SequenceBox
                                    aaSequence={aa_sequence}
                                />
                            </Col>

                            <Col xs={12} md={12}>
                                <h3>External databases</h3>
                                <OutLinks links={out_links} />
                            </Col>
                        </div>
                        }
                    </div>
                );
            case 'S':
                return (
                    <div>
                        <Col xs={12} md={12}>
                            <h1>{name}</h1>
                            <h3>ID: {selectedDatum}</h3>
                            <h4>Common name: {common_name}</h4>
                        </Col>
                    </div>
                );
            default:
                return (
                    <div>
                        ERROR! Invalid data type.
                    </div>
                );
        }
    }
}

DataBasicView.propTypes = {
    selectedDatum: PropTypes.string.isRequired,
    common_name: PropTypes.string,
    dataType: PropTypes.string.isRequired,
    description: PropTypes.string,
    out_links: PropTypes.object,
    name: PropTypes.string.isRequired,
    aa_sequence: PropTypes.string,
    venom_ref: PropTypes.string,
    species: PropTypes.array,
    dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const { selectedData, currentData } = state.inMemory;
    return {
        selectedData,
        currentData
    };
};

export default connect(mapStateToProps)(DataBasicView);
