import { h, render } from 'preact';
import Application from './components/Application';

if (process.env.NODE_ENV === 'development') {
    require('preact/devtools');
}

render(h(Application, null), document.getElementById('root'));
