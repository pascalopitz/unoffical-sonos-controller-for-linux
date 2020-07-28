import SonosEnhanced from "./SonosEnhanced";

export async function connectStatic(host, port = 1400) {
    if(host) {
        //model is not really used anywhere, let's ignore it for now
        let sonosEnhanced = new SonosEnhanced(host, null);
        await sonosEnhanced.initialise();
        return sonosEnhanced;
    }
}
