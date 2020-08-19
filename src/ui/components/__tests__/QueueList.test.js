import React from 'react';
import { QueueList } from '../QueueList';
import { render, mount } from 'enzyme';

jest.mock('../QueueListItem', () => () => <p className="queue-list-item" />); // eslint-disable-line

describe('QueueList', () => {
    it('renders and matches snapshot', () => {
        const props = {
            tracks: [
                {
                    id: 'foo',
                },
            ],
        };
        const context = render(<QueueList {...props} />);
        expect(context).toMatchSnapshot();
    });

    it('clicking executed props.flush clickHandler', () => {
        const flush = jest.fn();

        const props = {
            tracks: [
                {
                    id: 'foo',
                },
            ],
            flush,
        };
        const context = mount(<QueueList {...props} />);
        context.find('#queue-clear-button').simulate('click');
        expect(flush.mock.calls.length).toBe(1);

        context.unmount();
    });
});
