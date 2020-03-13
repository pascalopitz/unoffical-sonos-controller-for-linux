import React from 'react';
import { SearchBar } from '../SearchBar';
import { deep } from 'react-render-spy';

describe('SearchBar', () => {
    it('renders on', () => {
        const props = {
            sources: [],
            currentState: {}
        };
        const context = deep(<SearchBar {...props} />);
        expect(context.output()).toMatchSnapshot();
    });
});
