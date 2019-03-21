import chai, { expect } from 'chai';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { spy } from 'sinon';

Enzyme.configure({ adapter: new Adapter() });

describe('Mocha', () => {
  it('passes a trivial test', () => {
    expect(true).to.equal(true);
  });
});