export const CHANNEL_SEPARATOR = "/";
export const CHANNEL_SESSION_ID = "session";
export const CHANNEL_WS_ID = "ws";
export const CHANNEL_USER_ID = "user";
export const CHANNEL_CAMERA = "camera";
export const CHANNEL_TEMPERATURES = "temperatures";
export const CHANNEL_PROGRESS = "progress";
export const CHANNEL_PRINTER = "printer";
export const CHANNEL_EVENT = "event";
export const CHANNEL_REPLY = "reply";
export const CHANNEL_SUBSCRIPTIONS = "subscriptions";
export const CHANNEL_SERVER_COMM = "server";
export const CHANNEL_STREAM = "stream";
export const CHANNEL_RPC = "rpc";

export const CHANNEL_ZUPFE_PREFIX = "z";
export const CHANNEL_PRINTER_PREFIX = "p";
export const CHANNEL_SYSTEM_PREFIX = "sys";

const cameraStreamChannelMatcher = new RegExp(getChannelForCamera("(?<printerUuid>[^\/]+)", "(?<cameraId>[^\/]+)"));
const temperatureChannelMatcher = new RegExp(getChannelForTemperature("(?<printerUuid>[^\/]+)"));
const progressChannelMatcher = new RegExp(getChannelForProgress("(?<printerUuid>[^\/]+)"));

export function getCameraFromCameraChannel(channel) {
    const match = cameraStreamChannelMatcher.exec(channel);
    if (match) {
        return {
            data: {cameraId: Number.parseInt(match.groups.cameraId)},
            printerUuid: match.groups.printerUuid,
        }
    }
    return undefined;
}

export function getPrinterFromTemperatureChannel(channel) {
    const match = temperatureChannelMatcher.exec(channel);
    if (match) {
        return {
            printerUuid: match.groups.printerUuid,
        }
    }
    return undefined;
}

export function getPrinterFromProgressChannel(channel) {
    const match = progressChannelMatcher.exec(channel);
    if (match) {
        return {
            printerUuid: match.groups.printerUuid,
        }
    }
    return undefined;
}

export function getUserIdFromChannel(channel) {
    return channel.split(CHANNEL_SEPARATOR)[1];
}

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

// z/a/channel
export function getChannelForZupfeSocket(...args) {
    return getChannelFrom(CHANNEL_ZUPFE_PREFIX, ...args);
}

// p/a/channel
export function getChannelForPrinterSocket(...args) {
    return getChannelFrom(CHANNEL_PRINTER_PREFIX, ...args);
}

// z/session/:session
export function getChannelForSession(sessionId) {
    return getChannelForZupfeSocket(CHANNEL_SESSION_ID, sessionId);
}

// z/ws/:wsId
export function getChannelForWsId(wsId) {
    return getChannelForZupfeSocket(CHANNEL_WS_ID, wsId);
}

export function getChannelForPrinterUuid(uuid) {
    return getChannelForPrinterSocket(CHANNEL_PRINTER, uuid);
}

export function getChannelForUser(userId) {
    return getChannelForZupfeSocket(CHANNEL_USER_ID, userId);
}

export function getChannelForTemperature(printerUuid) {
    return getChannelForZupfeSocket(CHANNEL_PRINTER, printerUuid, CHANNEL_TEMPERATURES);
}

export function getChannelForProgress(printerUuid) {
    return getChannelForZupfeSocket(CHANNEL_PRINTER, printerUuid, CHANNEL_PROGRESS);
}

export function getChannelForCamera(printerUuid, cameraId) {
    return getChannelForZupfeSocket(CHANNEL_PRINTER, printerUuid, CHANNEL_CAMERA, cameraId);
}

export function getChannelForEvent(event) {
    return getChannelForZupfeSocket(CHANNEL_EVENT, event);
}

export function getChannelForRpc(messageId) {
    return getChannelForSystem(CHANNEL_RPC, messageId);
}

export function getChannelForStream(streamId) {
    return getChannelForSystem(CHANNEL_STREAM, streamId);
}