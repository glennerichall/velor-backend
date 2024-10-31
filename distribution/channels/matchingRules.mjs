import {
    MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_MJPEG
} from "../../../messaging/constants.mjs";
import {
    EVENT_PRINTER_PROGRESS,
    EVENT_PRINTER_TEMPERATURE,
    EVENT_SYSTEM_STATUS_CHANGED
} from "../../../shared/constants/events.mjs";

import {
    getChannelForCamera,
    getChannelForEvent,
    getChannelForPrinterUuid,
    getChannelForProgress,
    getChannelForServer,
    getChannelForSession,
    getChannelForTemperature,
    getChannelForUser,
} from "./channels.mjs";
import {eventNames} from "../../../shared/constants/eventNames.mjs";

export function forRequestSession(requestDetails) {
    const sessionId = requestDetails?.ws;
    return forSessionId(sessionId);
}

export function forSessionId(sessionId) {
    return getChannelForSession(sessionId);
}

export function forUserId(userId) {
    return getChannelForUser(userId);
}

export function forCameraStream(printerUuid, cameraId) {
    return getChannelForCamera(printerUuid, cameraId);
}

export function forPrinterUuid(printerUuid) {
    return getChannelForPrinterUuid(printerUuid);
}


export function forPrinterMessage(message, printerUuid) {
    let channel = null;
    switch (message.type) {
        case MESSAGE_TYPE_EVENT:
            switch (message.event) {
                case EVENT_PRINTER_TEMPERATURE:
                    channel = getChannelForTemperature(printerUuid);
                    break;
                case EVENT_PRINTER_PROGRESS:
                    channel = getChannelForProgress(printerUuid);
                    break;
            }
            break
        case MESSAGE_TYPE_MJPEG:
            channel = getChannelForCamera(printerUuid, message.streamId);
            break;
    }
    return channel;
}

export function forSystemChanged() {
    const event = eventNames[EVENT_SYSTEM_STATUS_CHANGED];
    return getChannelForEvent(event);
}

export function forAllClients() {
    return getChannelForUser('all');
}

export function forServerId(serverId) {
    return getChannelForServer(serverId);
}