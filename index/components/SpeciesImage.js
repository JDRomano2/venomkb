import React, { Component } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';

class SpeciesImage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="jdr-box">
        {(this.props.species_image_url !== undefined) &&
          <div>
            <Image
              className="bootstrap-image-resize"
              src={this.props.species_image_url}
            />
          </div>
        }
        {(this.props.species_image_url === undefined) &&
          <div>
            <Image
              className="bootstrap-image-resize"
              src="/not-available.png"
            />
            <center><small><i>We don't have an image for this species yet!</i></small></center>
          </div>
        }
      </div>
    );
  }
}

SpeciesImage.propTypes = {
  species_image_url: PropTypes.string
};

export default SpeciesImage;
