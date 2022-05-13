import ipRegex from 'ip-regex';
import urlRegexSafe from 'url-regex-safe';

import { createElement } from 'react';
import { render } from 'react-dom';

import Application from './components/Application';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

render(createElement(Application, null), document.getElementById('root'));

const MySwal = withReactContent(Swal);

window.ipPrompt = () => {
    return MySwal.fire({
        input: 'text',
        inputLabel: 'Your IP address',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!';
            }

            if (!ipRegex({ exact: true }).test(value)) {
                return 'Invalid IP address!';
            }
        },
    }).then(({ value }) => value);
};

window.urlPrompt = () => {
    return MySwal.fire({
        input: 'text',
        inputLabel: 'Media URL',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!';
            }

            if (!urlRegexSafe({ exact: true }).test(value)) {
                return 'Invalid URL!';
            }
        },
    }).then(({ value }) => value);
};
