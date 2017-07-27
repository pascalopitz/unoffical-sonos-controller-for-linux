import { h, Component } from 'preact';

class ZoneGroupMember extends Component {
    render() {
        return (
            <li>
                <span>
                    {this.props.member.name}
                </span>
            </li>
        );
    }
}

export default ZoneGroupMember;
