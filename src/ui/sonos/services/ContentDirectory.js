import Service from './Service';

class ContentDirectory extends Service {

    constructor (host, port) {
        super({
            name : 'ContentDirectory',
            host : host,
            port : port || 1400,
            controlURL : '/MediaServer/ContentDirectory/Control',
            eventSubURL : '/MediaServer/ContentDirectory/Event',
            SCPDURL : '/xml/ContentDirectory1.xml',
        });
    }

    Browse (options, callback) {
        this._request('Browse', options, callback);
    }
}

export default ContentDirectory;