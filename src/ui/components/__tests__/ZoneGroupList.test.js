import React from 'react';
import { ZoneGroupList } from '../ZoneGroupList';
import ZoneGroup from '../ZoneGroup';
import { deep } from 'react-render-spy';

jest.mock('../ZoneGroup');
ZoneGroup.mockReturnValue(<p />);

describe('ZoneGroupList', () => {
    let props;

    beforeEach(() => {
        props = {};
    });

    it('matches snapshot', () => {
        const context = deep(<ZoneGroupList {...props} />);
        expect(context.output()).toMatchSnapshot();
    });

    it('renders wrapper divs', () => {
        const context = deep(<ZoneGroupList {...props} />);
        expect(context.find('#zone-container-inner').length).toBe(1);
        expect(context.find('#zone-wrapper').length).toBe(1);
    });

    it('renders group items', () => {
        props.groups = {
            1: {
                foo: true
            },
            2: {
                foo: false
            }
        };

        const context = deep(<ZoneGroupList {...props} />);
        expect(context.output()).toMatchSnapshot();

        expect(ZoneGroup).toHaveBeenCalledTimes(2);

        const [firstCall, lastCall] = ZoneGroup.mock.calls;

        expect(firstCall[0]).toMatchObject({
            group: { foo: true },
            groups: props.groups
        });

        expect(lastCall[0]).toMatchObject({
            group: { foo: false },
            groups: props.groups
        });
    });
});
