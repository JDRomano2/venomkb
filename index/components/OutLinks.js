import React from 'react';
import PropTypes from 'prop-types';

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
            let resource_name = link.resource;
            let primary_id = link.primary_id;
            return (
                <li>{resource_name}: {primary_id}</li>
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
