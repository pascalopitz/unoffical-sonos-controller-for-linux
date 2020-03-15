import React from 'react';
import { Loader } from '../Loader';
import { render } from 'enzyme';

describe('Loader', () => {
    it('renders when props.hasCurrent is false', () => {
        const context = render(<Loader />);
        // expect(context.find('div').length).toBe(1);
        expect(context).toMatchSnapshot();
    });

    it('renders nothing is true', () => {
        const context = render(<Loader hasCurrent={true} />);
        // expect(context.find('div').length).toBe(0);
        expect(context).toMatchSnapshot();
    });
});
