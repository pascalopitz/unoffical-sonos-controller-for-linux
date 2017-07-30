import { h } from 'preact';

export function GroupManagementNode(props) {
    const checkboxSymbol =
        props.selected.indexOf(props.item.uuid) > -1
            ? 'check_box'
            : 'check_box_outline_blank';

    const _toggleSelection = () => {
        props.toggleGroup(props.item);
    };

    return (
        <li>
            <span>
                {props.item.name}
            </span>
            <i className="material-icons checkbox" onClick={_toggleSelection}>
                {checkboxSymbol}
            </i>
        </li>
    );
}

export default GroupManagementNode;
