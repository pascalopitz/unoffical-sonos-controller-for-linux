import ip from 'ip';

export const NS = 'http://www.sonos.com/Services/1.1';
export const IP_ADDRESS = ip.address('public');
export const LOCAL_PORT = 13453;

export function withinEnvelope(body, headers = '') {
    return [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="' +
            NS +
            '">',
        '<s:Header>' + headers + '</s:Header>',
        '<s:Body>' + body + '</s:Body>',
        '</s:Envelope>',
    ].join('');
}

export function stripNamespaces(xml) {
    return xml.replace(/\<\/[\w\d-]+:/gi, '</').replace(/\<[\w\d-]+:/gi, '<');
}
