import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectData, fetchData } from '../actions';
import { Link } from 'react-router-dom';
import { Nav, NavItem, Button, Glyphicon } from 'react-bootstrap';
import FileSaver from 'file-saver';

import DataBasicView from '../components/DataBasicView';
import DataJSONView from '../components/DataJSONView';
import DataClassView from '../components/DataClassView';

class DataDetailContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentVenomkbId: this.props.match.params.index,
            dataType: this.props.match.params.index.charAt(0),
            viewType: '1'
        };

        this.handleRefreshClick = this.handleRefreshClick.bind(this);
        this.handleChangeView = this.handleChangeView.bind(this);
    }

    componentWillMount() {
        this.props.dispatch(selectData(this.state.currentVenomkbId));
    }

    componentDidUpdate(prevProps) {
        if (this.props.selectedData !== prevProps.selectedData) {
            const { dispatch, selectedData } = this.props;
            dispatch(fetchData(selectedData));
        }
    }

    handleRefreshClick(e) {
        e.preventDefault();
        const { dispatch, selectedData } = this.props;
        dispatch(fetchData(selectedData));
    }

    handleChangeView(e) {
        const prevState = this.state.viewType;
        this.setState({
            viewType: e
        });
        this.state.viewType = e;
        if (this.state.viewType === '4') {
            this.triggerDownload();
            this.setState({
                viewType: prevState
            });
        }
    }

    triggerDownload() {
        const data = JSON.stringify(this.props.currentData);
        const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(blob, this.props.selectedData + '.json');
    }

    render() {
        const {
            selectedData,
            name,
            common_name,
            out_links,
            aa_sequence,
            description,
            venom_ref,
            venom,
            taxonomic_lineage,
            isFetching,
            species,
            pdb_image_url,
            pdb_structure_known,
            species_image_url,
            literature_references,
            literature_predications,
            go_annotations
        } = this.props;

        return (
            <div>
                <div style={{marginBottom: '5px'}}>
                    <Nav
                        bsStyle="tabs"
                        activeKey={this.state.viewType}
                        onSelect={this.handleChangeView}
                    >
                        <NavItem eventKey="1">Basic view</NavItem>
                        <NavItem eventKey="2">JSON</NavItem>
                        <NavItem eventKey="3">Class view</NavItem>
                        <NavItem eventKey="4">Download <Glyphicon glyph="download-alt" /></NavItem>
                    </Nav>
                </div>
                <div id="issueReportBtn">
                    <Button
                        bsSize="xsmall"
                        style={{'backgroundColor': '#A0B4B0'}}
                    >
                        <i>Found an error? Click here.</i>
                    </Button>
                </div>

                <div id="return-link">
                    <Link to={'/data'}>
                        <Glyphicon glyph="triangle-left" />Return to search
                    </Link>
                </div>

                <div>
                    {isFetching && name === undefined &&
                     <div>
                         <h1>Loading...</h1>
                     </div>
                    }

                    {(!isFetching && !(name === undefined)) &&
                        <div>
                            {(this.state.viewType === '1') &&
                                <DataBasicView
                                    selectedDatum={selectedData}
                                    dataType={this.state.dataType}
                                    name={name}
                                    common_name={common_name}
                                    out_links={out_links}
                                    aa_sequence={aa_sequence}
                                    description={description}
                                    venom_ref={venom_ref}
                                    venom={venom}
                                    taxonomic_lineage={taxonomic_lineage}
                                    isFetching={isFetching}
                                    species={species}
                                    pdb_image_url={pdb_image_url}
                                    pdb_structure_known={pdb_structure_known}
                                    species_image_url={species_image_url}
                                    predications={literature_predications}
                                    refs={literature_references}
                                    go_annotations={go_annotations}
                                />
                            }
                            {(this.state.viewType === '2') &&
                                <DataJSONView
                                    currentJSON={this.props.currentData}
                                />
                            }
                            {(this.state.viewType === '3') &&
                                <DataClassView/>
                            }
                        </div>
                    }
                </div>
            </div>
        );
    }
}

DataDetailContainer.propTypes = {
    currentData: PropTypes.object.isRequired,
    selectedData: PropTypes.string,
    description: PropTypes.string,
    out_links: PropTypes.array,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired,
    name: PropTypes.string,
    common_name: PropTypes.string,
    aa_sequence: PropTypes.string,
    venom_ref: PropTypes.string,
    venom: PropTypes.object,
    species: PropTypes.array,
    match: PropTypes.object,
    taxonomic_lineage: PropTypes.array,
    pdb_image_url: PropTypes.string,
    pdb_structure_known: PropTypes.bool,
    species_image_url: PropTypes.string,
    viewType: PropTypes.string,
    literature_references: PropTypes.array,
    literature_predications: PropTypes.array,
    go_annotations: PropTypes.array
};


const mapStateToProps = (state) => {
    const { selectedData, currentData } = state.inMemory;
    const { species } = state.resources;
    const {
        isFetching,
        lastUpdated,
        name,
        common_name,
        out_links,
        aa_sequence,
        description,
        venom_ref,
        venom,
        taxonomic_lineage,
        pdb_image_url,
        pdb_structure_known,
        species_image_url,
        literature_references,
        literature_predications,
        go_annotations
    } = currentData || {
        isFetching: true,
        name: '',
        common_name: '',
        out_links: [],
        aa_sequence: '',
        description: '',
        venom_ref: '',
        venom: {},
        taxonomic_lineage: [],
        pdb_image_url: '',
        pdb_structure_known: false,
        species_image_url: '',
        literature_references: [],
        literature_predications: [],
        go_annotations: []
    };

    return {
        currentData,
        selectedData,
        out_links,
        aa_sequence,
        isFetching,
        lastUpdated,
        description,
        name,
        common_name,
        venom_ref,
        venom,
        species,
        taxonomic_lineage,
        pdb_image_url,
        pdb_structure_known,
        species_image_url,
        literature_references,
        literature_predications,
        go_annotations
    };
};

export default connect(mapStateToProps)(DataDetailContainer);
