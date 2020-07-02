const STREAM_URL_PREFIXES = [
    `x-sonosapi-stream:`,
    `x-sonosapi-radio:`,
    `x-rincon-mp3radio:`,
    `hls-radio:`,
    `aac:`,
];

export function isStreamUrl(url) {
    if (!url) {
        return false;
    }

    const [prefix] = url.toLowerCase().split(':');
    return STREAM_URL_PREFIXES.indexOf(`${prefix}:`) > -1;
}
