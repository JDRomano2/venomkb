import React from 'react';
import PropTypes from 'prop-types';
import { Button, DropdownButton, MenuItem, ButtonToolbar } from 'react-bootstrap';
import FileSaver from 'file-saver';

const breakString = (stringToBreak) => {
  const parts = stringToBreak.match(/.{1,10}/g);
  return parts.join(' ');
};

const blastQueryBase = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&QUERY=';

class SequenceBox extends React.Component {
  constructor(props) {
    super(props);

    const brokenSequence = breakString(props.aaSequence);

    this.state = {
      brokenSequence,
    };

    this.saveFasta = this.saveFasta.bind(this);
  }

  saveFasta() {
    const sequence = this.props.aaSequence;
    const fastaText = this.props.fastaLabel + '\n' + sequence + '\n';
    const blob = new Blob([fastaText], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, 'fasta.txt');
  }

  handleFocus(event) {
    event.target.select();
  }

  render() {
    const blastQueryUrl = blastQueryBase + this.props.aaSequence;
    return (
      <div className="jdr-box">
        <h3>Amino Acid Sequence</h3>
        <div className="pull-right run-tools-button">
          <ButtonToolbar>
            <DropdownButton
              bsSize="xsmall"
              title="Run tools"
              id="dropdown-size-extra-small"
              pullRight
              onSelect={this.handleToolSelect}
            >
              <MenuItem href={blastQueryUrl} target="_blank">BLASTp (NCBI)</MenuItem>
              <MenuItem eventKey="2">BLAST (PDB)</MenuItem>
            </DropdownButton>
            <Button
              onClick={this.saveFasta}
              bsSize="xsmall"
            >
              Download as FASTA
            </Button>
          </ButtonToolbar>
        </div>

        <h4>Number of residues: {this.props.aaSequence.length}</h4>
        <div
          className="sequenceText"
          onClick={this.handleFocus}
        >
          {this.state.brokenSequence}
        </div>
      </div>
    );
  }
}

SequenceBox.propTypes = {
  aaSequence: PropTypes.string,
  fastaLabel: PropTypes.string
};

export default SequenceBox;
