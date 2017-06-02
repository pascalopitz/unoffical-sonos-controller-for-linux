import { h, render } from 'preact';
import Application from './components/Application';

render(
    h(Application, null),
    document.getElementById('root')
);
