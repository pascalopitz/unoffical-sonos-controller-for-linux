import React from 'react';
import { MuteButton } from '../MuteButton';
import { render, mount } from 'enzyme';

describe('MuteButton', () => {
    it('renders on', () => {
        const props = {
            muted: false,
        };
        const context = render(<MuteButton {...props} />);
        expect(context).toMatchSnapshot();
    });

    it('renders off', () => {
        const props = {
            muted: true,
        };
        const context = render(<MuteButton {...props} />);
        expect(context).toMatchSnapshot();
    });

    it('clickhandler', () => {
        const props = {
            clickHandler: jest.fn(),
        };
        const context = mount(<MuteButton {...props} />);
        context.find('.mute-button').simulate('click');
        expect(props.clickHandler).toHaveBeenCalled();

        context.unmount();
    });
});
