import React from 'react';
import { MuteButton } from '../MuteButton';
import { deep } from 'react-render-spy';

describe('MuteButton', () => {
    it('renders on', () => {
        const props = {
            muted: false
        };
        const context = deep(<MuteButton {...props} />);
        expect(context.output()).toMatchSnapshot();
    });

    it('renders off', () => {
        const props = {
            muted: true
        };
        const context = deep(<MuteButton {...props} />);
        expect(context.output()).toMatchSnapshot();
    });

    it('clickhandler', () => {
        const props = {
            clickHandler: jest.fn()
        };
        const context = deep(<MuteButton {...props} />);
        context.find('.mute-button').simulate('click');
        expect(props.clickHandler).toHaveBeenCalled();
    });
});
