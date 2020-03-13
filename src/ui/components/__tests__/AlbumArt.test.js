import React from 'react';
import { AlbumArt } from '../AlbumArt';
import { render } from 'enzyme';

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

        const context = render(<AlbumArt {...props} />);
        expect(context).toMatchSnapshot();
    });
});
