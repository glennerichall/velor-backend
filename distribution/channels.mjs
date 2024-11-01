export const CHANNEL_SEPARATOR = "/";
export const CHANNEL_EVENT = "event";
export const CHANNEL_REPLY = "reply";
export const CHANNEL_SUBSCRIPTIONS = "subscriptions";
export const CHANNEL_SERVER_COMM = "server";
export const CHANNEL_STREAM = "stream";
export const CHANNEL_RPC = "rpc";
export const CHANNEL_SYSTEM_PREFIX = "sys";

export function getChannelFrom(...args) {
    return args.join(CHANNEL_SEPARATOR);
}

// sys/a/channel
export function getChannelForSystem(...args) {
    return getChannelFrom(CHANNEL_SYSTEM_PREFIX, ...args);
}

export function getChannelForServer(server) {
    return getChannelForSystem(CHANNEL_SERVER_COMM, server);
}

export function getChannelForInterServerCall() {
    return getChannelForSystem(CHANNEL_SERVER_COMM)
}

// sys/subscriptions
export function getChannelForSubscriptions() {
    return getChannelForSystem(CHANNEL_SUBSCRIPTIONS);
}

// sys/reply
export function getChannelForReply() {
    return getChannelForSystem(CHANNEL_REPLY);
}

export function getChannelForRpc(messageId) {
    return getChannelForSystem(CHANNEL_RPC, messageId);
}

export function getChannelForStream(streamId) {
    return getChannelForSystem(CHANNEL_STREAM, streamId);
}