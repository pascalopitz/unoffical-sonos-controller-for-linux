import { h } from 'preact';
import { SearchBar } from '../SearchBar';
import { deep } from 'preact-render-spy';

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
