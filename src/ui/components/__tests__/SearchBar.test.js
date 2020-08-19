import React from 'react';
import { SearchBar } from '../SearchBar';
import { render } from 'enzyme';

jest.mock('../SearchBarSources', () => () => <p />); // eslint-disable-line

describe('SearchBar', () => {
    it('renders on', () => {
        const props = {
            sources: [],
            currentState: {},
        };
        const context = render(<SearchBar {...props} />);
        expect(context).toMatchSnapshot();
    });
});
