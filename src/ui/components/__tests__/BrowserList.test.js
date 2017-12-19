import { h } from 'preact';
import { BrowserList } from '../BrowserList';
import BrowserListItem from '../BrowserListItem';
import { deep } from 'preact-render-spy';

jest.mock('../BrowserListItem');
BrowserListItem.mockReturnValue(<p />);

describe('BrowserList', () => {
    it('renders and matches snapshot', () => {
        const props = {
            currentState: {
                items: [
                    {
                        id: 1
                    }
                ],
                title: 'My List',
                sournce: 'source'
            },
            history: []
        };

        const context = deep(<BrowserList {...props} />);
        expect(context.output()).toMatchSnapshot();

        const [firstCall] = BrowserListItem.mock.calls;

        expect(firstCall[0].model).toMatchObject({
            id: 1
        });
    });
});
