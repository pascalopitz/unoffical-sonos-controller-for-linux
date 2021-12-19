import { contextBridge } from 'electron';
import { IP_ADDRESS, LOCAL_PORT } from '../common/ip';

contextBridge.exposeInMainWorld('ipHelper', { IP_ADDRESS, LOCAL_PORT });

console.log({
    IP_ADDRESS,
    LOCAL_PORT,
});
