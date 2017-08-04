import { createAction } from 'redux-actions';
import Constants from '../constants';

let poll;

const authTokenReceived = createAction(
    Constants.MUSICSERVICE_AUTH_TOKEN_RECEIVED
);

export const hideManagement = createAction(
    Constants.MUSICSERVICE_ADD_CANCEL,
    () => {
        if (poll) {
            window.clearInterval(poll);
            poll = null;
        }
    }
);

export const getSession = createAction(
    Constants.MUSICSERVICE_SESSION_ID_RECEIVED,
    async (client, username, password) => {
        if (client.auth === 'UserId') {
            const sessionId = await client.getSessionId(username, password);

            if (!sessionId) {
                return;
            }

            const authToken = {
                authToken: sessionId
            };

            // TODO: fix this
            await SonosService.rememberMusicService(
                client._serviceDefinition,
                authToken
            );

            return authToken;
        }
    }
);

export const getLink = createAction(
    Constants.MUSICSERVICE_ADD_LINK_RECEIVED,
    async client => {
        let link;

        if (client.auth === 'DeviceLink') {
            link = await client.getDeviceLinkCode();
        }

        if (client.auth === 'AppLink') {
            link = await client.getAppLink();
        }

        poll = window.setInterval(async () => {
            const authToken = await client.getDeviceAuthToken(
                link.linkCode,
                link.linkDeviceId
            );
            if (!authToken) {
                return;
            }

            // TODO: fix this
            await SonosService.rememberMusicService(
                client._serviceDefinition,
                authToken
            );

            authTokenReceived(authToken);
            window.clearInterval(poll);
        }, 5000);

        return link;
    }
);

export const addAnonymousService = createAction(
    Constants.MUSICSERVICE_ANONYMOUS
);
