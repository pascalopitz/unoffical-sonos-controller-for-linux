import { h } from 'preact';
import { ZoneGroup } from '../ZoneGroup';
import ZoneGroupPlayState from '../ZoneGroupPlayState';
import ZoneGroupMember from '../ZoneGroupMember';
import { deep } from 'preact-render-spy';

jest.mock('../ZoneGroupMember');
ZoneGroupMember.mockReturnValue(<p className="member" />);

jest.mock('../ZoneGroupPlayState');
ZoneGroupPlayState.mockReturnValue(<p className="play-state" />);

describe('ZoneGroup', () => {
    let props;

    beforeEach(() => {
        props = {
            group: [
                {
                    member: 1,
                    coordinator: 'true',
                    host: 'myhost'
                }
            ],
            selectGroup: jest.fn(),
            showManagement: jest.fn(),
            playStates: {
                myhost: {
                    playing: true
                }
            }
        };
    });

    it('matches snapshot', () => {
        const context = deep(<ZoneGroup {...props} />);
        expect(context.output()).toMatchSnapshot();
        expect(context.find('.not-selected').length).toBe(1);
        expect(ZoneGroupPlayState).toHaveBeenCalled();

        const [lastCall] = ZoneGroupPlayState.mock.calls;
        expect(lastCall[0]).toMatchObject({
            playState: {
                playing: true
            }
        });
    });

    it('matches snapshot when selected', () => {
        const currentHost = 'myhost';

        props = {
            ...props,
            currentHost
        };

        const context = deep(<ZoneGroup {...props} />);
        expect(context.output()).toMatchSnapshot();
        expect(context.find('.selected').length).toBe(1);
    });

    it('clicking whole group selects it', () => {
        const context = deep(<ZoneGroup {...props} />);
        context.find('.zone-group').simulate('click');
        expect(props.selectGroup).toHaveBeenCalled();
    });

    it('clicking button opens management', () => {
        const context = deep(<ZoneGroup {...props} />);

        context.find('.group-button').simulate('click', {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        });

        expect(props.showManagement).toHaveBeenCalled();
    });
});
