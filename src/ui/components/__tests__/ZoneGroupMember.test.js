import { h } from 'preact';
import { ZoneGroupMember } from '../ZoneGroupMember';
import { deep } from 'preact-render-spy';

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
