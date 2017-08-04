import { h } from 'preact';
import { Loader } from '../Loader';
import { deep } from 'preact-render-spy';

describe('Loader', () => {
    it('renders when props.hasCurrent is false', () => {
        const context = deep(<Loader />);
        expect(context.find('div').length).toBe(1);
        expect(context.output()).toMatchSnapshot();
    });

    it('renders nothing is true', () => {
        const context = deep(<Loader hasCurrent={true} />);
        expect(context.find('div').length).toBe(0);
        expect(context.output()).toMatchSnapshot();
    });
});
