import { h } from 'preact';
import { AlbumArt } from '../AlbumArt';
import { deep } from 'preact-render-spy';

import {
    getClosest,
    createIntersectionObserver,
    purgeIntersectionObserver
} from '../../helpers/dom-utility';

jest.mock('../../helpers/dom-utility');
getClosest.mockReturnValue(null);
createIntersectionObserver.mockReturnValue(null);
purgeIntersectionObserver.mockReturnValue(null);

describe('AlbumArt', () => {
    it('renders and matches snapshot', () => {
        const props = {
            src: 'foo'
        };

        const context = deep(<AlbumArt {...props} />);
        expect(context.output()).toMatchSnapshot();
    });
});
