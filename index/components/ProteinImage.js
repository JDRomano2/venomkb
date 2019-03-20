import React, { Component } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

class ProteinImage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="jdr-box">
        {(this.props.pdb_image_url !== '') &&
          <div>
            <Image
              className="bootstrap-image-resize"
              src={this.props.pdb_image_url}
            />
            {this.props.pdb_structure_known &&
              <div>
                <center>
                  <small><i>Exact structure found in PDB</i></small>
                </center>
              </div>
            }
            {!this.props.pdb_structure_known &&
              <div>
                <center>
                  <small><i>No exact structure in PDB - similar structure shown above </i></small><span
                    className="glyphicon glyphicon-info-sign"
                    data-tip="Similar structure identified using PDB's BLAST API"
                  />
                  <ReactTooltip />
                </center>
              </div>
            }
          </div>
        }
        {(this.props.pdb_image_url === '') &&
          <div>
            <Image
              className="bootstrap-image-resize"
              src="/not-available.png"
            />
            <center>
              <small><i>No known 3D structure in PDB and no similar sequences found </i></small><span
                className="glyphicon glyphicon-info-sign"
                data-tip="No BLASTp results with e <= 1e-10 in PDB"
              />
              <ReactTooltip />
            </center>
          </div>
        }
      </div>
    );
  }
}

ProteinImage.propTypes = {
  pdb_image_url: PropTypes.string,
  pdb_structure_known: PropTypes.bool
};

export default ProteinImage;
