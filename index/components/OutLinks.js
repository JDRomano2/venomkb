import React from 'react';
import PropTypes from 'prop-types';

class OutLink extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            resource_name: props.resource,
            resource_id: props.id
        };
    }

    render() {
        return (
            <li>{this.state.resource_name}: {this.state.resource_id}</li>
        );
    }
}

class OutLinks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            outLinks: props.links
        };
    }

    render() {
        const { outLinks } = this.state;
        const links = outLinks.map(link => {
            let key = link.resource;
            let primary_id = link.primary_id;
            return (
                <OutLink key={key} resource={key} id={primary_id} />
            );
        });

        return (
            <div>
                <ul>
                    {links}
                </ul>
            </div>
        );
    }
}

OutLinks.propTypes = {
    links: PropTypes.array
};

export default OutLinks;
