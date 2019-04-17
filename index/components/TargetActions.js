import React from 'react';

import TargetAction from '../components/TargetAction.js';

class TargetActions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      target_actions: this.props.targets
    };
  }

  render() {
    return (
      <div>
        <TargetAction
          targetAction={this.state.target_actions[0]}
        />
      </div>
    );
  }
}

export default TargetActions;
