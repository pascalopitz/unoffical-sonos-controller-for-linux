import { h } from 'preact';
import { QueueList } from '../QueueList';
import QueueListItem from '../QueueListItem';
import { deep } from 'preact-render-spy';

jest.mock('../QueueListItem');
QueueListItem.mockReturnValue(<p className="queue-list-item" />);

describe('QueueList', () => {
    it('renders and matches snapshot', () => {
        const props = {
            tracks: [
                {
                    id: 'foo'
                }
            ]
        };
        const context = deep(<QueueList {...props} />);
        expect(context.output()).toMatchSnapshot();
    });

    it('clicking executed props.flush clickHandler', () => {
        const flush = jest.fn();

        const props = {
            tracks: [
                {
                    id: 'foo'
                }
            ],
            flush
        };
        const context = deep(<QueueList {...props} />);
        context.find('#queue-clear-button').simulate('click');
        expect(flush.mock.calls.length).toBe(1);
    });
});
