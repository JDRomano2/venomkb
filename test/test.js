import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import App from '../index/components/App';

// Making sure the test library works
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});

// React automatic function calls for components
spy(App.prototype, 'componentDidMount');

describe('<App />', () => {
    it('calls componentDidMount', () => {
        const wrapper = mount(<App />);
        expect(App.prototype.componentDidMount.calledOnce).to.equal(true);
    });
});