import { configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import util from 'util';

Object.defineProperty(global, 'TextEncoder', {
    value: util.TextEncoder,
});

configure({ adapter: new Adapter() });

window.QueueActions = {};
window.ZoneGroupActions = {};
window.BrowserListSelectors = {};
window.BrowserListActions = {};
