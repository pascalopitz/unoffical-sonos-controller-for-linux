import _ from 'lodash';

export function getPlayers(state) {
    return _(state.sonosService.zones).sortBy('name').value();
}
