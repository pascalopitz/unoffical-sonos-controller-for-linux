import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
configure({ adapter: new Adapter() });

window.QueueActions = {};
window.ZoneGroupActions = {};
window.BrowserListSelectors = {};
window.BrowserListActions = {};
