import fs from 'fs';
import http from 'http';
import _ from 'lodash';
import mime from 'mime-types';
import ip from 'ip';
import id3 from 'music-tag';

const PORT = 13453;

class LocalMusicFileServer {

    constructor() {
        this.server = http.createServer((req, res) => {
        //     let body = [];

        //     req.on('data', (chunk) => {
        //         body.push(chunk);
        //     }).on('end', () => {
        //         body = Buffer.concat(body).toString();

        //         let match = _.find(this.tracks, { path: req.url });

        //         if(match) {
        //             let p = unescape(match.path);
        //             fs.stat(p, (err, stats) => {
        //                 res.writeHead(200, {
        //                     'Content-Type': mime.lookup(p),
        //                     'Content-Length': stats.size
        //                 });
        //                 fs.createReadStream(p).pipe(res);
        //             });
        //         } else {
        //             res.writeHead(404, {'Content-Type': 'text/plain' });
        //             res.end('not found');
        //         }
        //     });
        });

        this.server.listen(PORT);
    }

    mount() {

        return Promise.resolve({});

        // let ipAddress = ip.address()

        // return id3.read(process.env.HOME + '/Music', {
        //     recursive: true
        // })
        // .then((infos) => {


        //     this.tracks = [];
        //     this.albums = [];
        //     this.artists = [];

        //     infos.forEach((i) => {
        //         if(i.data.artist && _.includes(this.artists, i.data.artist) === false) {
        //             this.artists.push(i.data.artist);
        //         }

        //         if(i.data.album && _.includes(this.albums, i.data.album) === false) {
        //             this.albums.push(i.data.album);
        //         }

        //         if(i.data.title) {
        //             this.tracks.push({
        //                 data: i.data,
        //                 class: 'object.item.track',
        //                 title: i.data.title,
        //                 artist: i.data.artist,
        //                 albumArtURI: ``,
        //                 album: i.data.album,
        //                 path: escape(i.path),
        //                 uri: `http://${ipAddress}:${PORT}${escape(i.path)}`,
        //             });
        //         }
        //     });

        //     this.tracks = _.sortBy(this.tracks, 'title');

        //     this.artists = _.sortBy(this.artists, String).map((i) => {
        //         return {
        //             title: i,
        //         };
        //     });

        //     this.albums = _.sortBy(this.albums, String).map((i) => {
        //         return {
        //             title: i,
        //         };
        //     });
        // })
        // .then(() => {
        //     return {
        //         tracks: this.tracks,
        //         albums: this.albums,
        //         artists: this.artists,
        //     };
        // });
    }

    // getData() {
    //     return {
    //         tracks: this.tracks,
    //         albums: this.albums,
    //         artists: this.artists,
    //     };
    // }
}

const server = new LocalMusicFileServer();
server.mount().then((results) => {
    process.send({
        workerEvent: 'taskResponse',
        // response: results //server.getData(),
    });
});

process.on('message', (data) => {
    console.log(data);
});

// process.send({
//     alive: 1
// });

