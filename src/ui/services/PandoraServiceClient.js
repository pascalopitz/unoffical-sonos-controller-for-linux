// import _ from 'lodash';

// import moment from 'moment';

import crypto from 'crypto';
import requestHelper from 'request';
// import xml2json from 'jquery-xml2json';

// import SonosService from '../services/SonosService';

// const NS = 'http://www.sonos.com/Services/1.1';
// const deviceProviderName =  'SonosControllerForChrome';
// const RUNTIME_ID = 'pascal-sonos-app';

const PARTNER_USERNAME = 'iphone';
const PARTNER_PASSWORD = 'P2E4FC0EAD3*878N92B2CDp34I0B1@388137C';
const PARTNER_DEVICEID = 'IP01';
const API_VERSION = '5';

const ENCRYPTION_PASSWORD = '721^26xE22776';
const DECRYPTION_PASSWORD = '20zE1E47BE57$51';

function pandoraEncode(str) {
    const buf = Buffer.from(ENCRYPTION_PASSWORD, "base64");
    const cipher = crypto.createCipheriv('bf-ecb', buf, Buffer.alloc(0));

    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log(encrypted);

    return encrypted;
}

function pandoraDecode(str) {
    const buf = Buffer.from(DECRYPTION_PASSWORD, "base64");
    const decipher = crypto.createDecipheriv('bf-ecb', buf, Buffer.alloc(0));

    let decrypted = decipher.update(str, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted);

    return decrypted;
}

class PandoraServiceClient {

    constructor(serviceDefinition) {
        this._serviceDefinition = serviceDefinition;

        this.name = serviceDefinition.Name;
        this.auth = serviceDefinition.Auth;
    }

    _getPartnerCode() {
        return new Promise((resolve, reject) => {
            requestHelper({
                method: 'POST',
                uri: this._serviceDefinition.SecureUri + '?method=auth.partnerLogin',
                json: {
                    username: PARTNER_USERNAME,
                    password: PARTNER_PASSWORD,
                    deviceModel: PARTNER_DEVICEID,
                    version: API_VERSION,
                }
            }, (err, res, body) => {
                if(err) {
                    reject(err);
                } else if (res.statusCode != 200) {
                    reject(body);
                } else {
                    this.partnerAuthToken = body.result.partnerAuthToken;
                    this.partnerId = body.result.partnerId;
                    resolve(body);
                }
            });
        });
    }

    _userLogin(username, password) {

        const params = {
            username,
            password,
            partnerAuthToken: this.partnerAuthToken,
            loginType: 'user',
            returnStationList: true,
        };
        const body = pandoraEncode(JSON.stringify(params));

        return new Promise((resolve, reject) => {
            requestHelper({
                method: 'POST',
                uri: this._serviceDefinition.SecureUri + '?method=auth.userLogin&partner_id=' + this.partnerId + '&partner_auth_token=' + escape(this.partnerAuthToken),
                body,
            }, (err, res, body) => {
                if(err) {
                    reject(err);
                } else if (res.statusCode != 200) {
                    reject(body);
                } else {
                    resolve(body);
                }
            });
        });
    }

    getSessionId(username, password) {
        return Promise.resolve()
            .then(() => {
                return this._getPartnerCode();
            })
            .then(() => {
                return this._userLogin(username, password);
            });
    }


}

export default PandoraServiceClient;
