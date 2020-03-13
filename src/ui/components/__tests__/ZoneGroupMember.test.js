import React from 'react';
import { ZoneGroupMember } from '../ZoneGroupMember';
import { deep } from 'react-render-spy';

describe('ZoneGroupMember', () => {
    it('matches snapshot', () => {
        const props = {
            member: {
                name: 'My Name'
            }
        };
        const context = deep(<ZoneGroupMember {...props} />);
        expect(context.output()).toMatchSnapshot();
    });
});
