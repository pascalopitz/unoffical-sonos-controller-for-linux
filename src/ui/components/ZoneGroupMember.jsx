import { h, Component } from 'preact'; //eslint-disable-line

class ZoneGroupMember extends Component {
    render () {
        return (
            <li>
                <span>{this.props.member.name}</span>
            </li>
        );
    }
}

export default ZoneGroupMember;