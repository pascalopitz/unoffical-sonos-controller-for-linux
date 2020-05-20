import React from 'react';
import { ZoneGroupList } from '../ZoneGroupList';
import { render, mount } from 'enzyme';

jest.mock('../ZoneGroup', () => () => <p />);

describe('ZoneGroupList', () => {
    let props;

    beforeEach(() => {
        props = {
            groups: [],
        };
    });

    it('matches snapshot', () => {
        const context = render(<ZoneGroupList {...props} />);
        expect(context).toMatchSnapshot();
    });

    it('renders wrapper divs', () => {
        const context = mount(<ZoneGroupList {...props} />);
        expect(context.find('#zone-container-inner').length).toBe(1);
        expect(context.find('#zone-wrapper').length).toBe(1);
        context.unmount();
    });

    it('renders group items', () => {
        props.groups = [
            {
                ID: 1,
                foo: true,
            },
            {
                ID: 2,
                foo: false,
            },
        ];

        const context = mount(<ZoneGroupList {...props} />);
        expect(context).toMatchSnapshot();

        // expect(ZoneGroup).toHaveBeenCalledTimes(2);

        // const [firstCall, lastCall] = ZoneGroup.mock.calls;

        // expect(firstCall[0]).toMatchObject({
        //     group: { foo: true },
        //     groups: props.groups
        // });

        // expect(lastCall[0]).toMatchObject({
        //     group: { foo: false },
        //     groups: props.groups
        // });

        context.unmount();
    });
});
