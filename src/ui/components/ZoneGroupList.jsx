import { h, Component } from 'preact';

import ZoneGroup from './ZoneGroup';
import ZoneGroupStore from '../stores/ZoneGroupStore';

class ZoneGroupList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groups: ZoneGroupStore.getAll(),
            playStates: ZoneGroupStore.getPlayStates(),
            current: ZoneGroupStore.getCurrent()
        };
    }

    componentDidMount() {
        ZoneGroupStore.addChangeListener(this._onChange.bind(this));
    }

    _onChange() {
        this.setState({
            groups: ZoneGroupStore.getAll(),
            playStates: ZoneGroupStore.getPlayStates(),
            current: ZoneGroupStore.getCurrent()
        });
    }

    render() {
        // TODO: SORT PROPERLY
        // let items = this.state.groups.sort((item1, item2) => {
        //     let members1 = item1.ZoneGroupMember.sort(sort.asc);
        //     let members2 = item2.ZoneGroupMember.sort(sort.asc);

        //     return sort.asc(members1[0], members2[0]);
        // });

        const zoneGroupNodes = Object.keys(this.state.groups).map(key => {
            const item = this.state.groups[key];

            return (
                <ZoneGroup
                    key={key}
                    playStates={this.state.playStates}
                    group={item}
                    currentZone={this.state.current}
                />
            );
        });

        return (
            <div
                id="zone-container-inner"
                style="width:100%;display: flex; flex-direction: column;"
            >
                <div style="overflow-y: auto;">
                    <div id="zone-wrapper">
                        {zoneGroupNodes}
                    </div>
                </div>
            </div>
        );
    }
}

export default ZoneGroupList;
