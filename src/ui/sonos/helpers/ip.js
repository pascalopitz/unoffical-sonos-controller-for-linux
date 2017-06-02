import os from 'os';
const ifaces = os.networkInterfaces();

let firstInterface;

Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
        if (firstInterface || 'IPv4' !== iface.family || iface.internal !== false) {
            return;
        }

        firstInterface = iface;
    });
});

const ip = {
    address: function () {
        return firstInterface.address;
    }
};

export default ip;
