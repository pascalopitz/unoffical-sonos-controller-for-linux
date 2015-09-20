"use strict";

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants  from '../constants/Constants';

let poll;

export default {
    hideManagement () {
        Dispatcher.dispatch({
            actionType: Constants.MUSICSERVICE_ADD_CANCEL,
        });

        if(poll) {
            window.clearInterval(poll);
            poll = null;
        }
    },

    getLink (client) {
        if(client.auth === 'DeviceLink') {
            client.getDeviceLinkCode().then((link) => {
                Dispatcher.dispatch({
                    actionType: Constants.MUSICSERVICE_ADD_LINK_RECEIVED,
                    link: link
                });

                poll = window.setInterval(() => {
                    client.getDeviceAuthToken(link.linkCode).then((token) => {
                        Dispatcher.dispatch({
                            actionType: Constants.MUSICSERVICE_AUTH_TOKEN_RECEIVED,
                            authToken: authToken
                        });
                        window.clearInterval(poll);
                    })
                }, 5000);
            });
        }
    }
};
