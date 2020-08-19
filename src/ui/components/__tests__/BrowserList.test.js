import React from 'react';
import { BrowserList } from '../BrowserList';
import { render } from 'enzyme';

jest.mock('../BrowserListItem', () => () => <p />); // eslint-disable-line

describe('BrowserList', () => {
    it('renders and matches snapshot', () => {
        const props = {
            currentState: {
                items: [
                    {
                        id: 1,
                    },
                ],
                title: 'My List',
                sournce: 'source',
            },
            history: [],
        };

        const context = render(<BrowserList {...props} />);
        expect(context).toMatchSnapshot();
    });
});
