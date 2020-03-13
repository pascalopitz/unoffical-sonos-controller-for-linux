import { createElement } from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

render(createElement(Application, null), document.getElementById('root'));
