import {createProxyReplaceResult} from "../proxy.mjs";

export function createProxyAutoSendResultOnCall(target, transport, options) {
    const sendMessage = async (message) => {
        try {
            return await transport.send(message, options);
        } catch (e) {
            console.log('failed to send ' + e)
        }
    };
    return createProxyReplaceResult(target, sendMessage);
}