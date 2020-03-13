import React from 'react';
import { ZoneGroupMember } from '../ZoneGroupMember';
import { render } from 'enzyme';

describe('ZoneGroupMember', () => {
    it('matches snapshot', () => {
        const props = {
            member: {
                name: 'My Name'
            }
        };
        const context = render(<ZoneGroupMember {...props} />);
        expect(context).toMatchSnapshot();
    });
});
