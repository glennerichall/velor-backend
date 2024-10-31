import {
    getChannelForCamera,
    getChannelForEvent,
    getChannelForPrinterUuid,
    getChannelForProgress,
    getChannelForSession,
    getChannelForTemperature,
    getChannelForUser,
    getChannelForWsId
} from "./channels.mjs";
import {
    RPC_REQUEST_READ_TEMPERATURES,
    RPC_REQUEST_RECEIVE_PROGRESS,
    RPC_REQUEST_START_CAMERA,
    RPC_REQUEST_STOP_CAMERA,
    RPC_REQUEST_STOP_PROGRESS,
    RPC_REQUEST_STOP_TEMPERATURES
} from "../../../shared/constants/commands.mjs";
import {eventNames} from "../../../shared/constants/eventNames.mjs";
import {EVENT_SYSTEM_STATUS_CHANGED} from "../../../shared/constants/events.mjs";
import {getChannelSet} from "../subscriber/subscriber.mjs";

export function bySession(client) {
    let sessionId = client.sessionId;
    return getChannelForSession(sessionId);
}

export function byWsId(client) {
    let wsId = client.id;
    return getChannelForWsId(wsId);
}

export function byPrinterId(client) {
    let uuid = client.uuid;
    return getChannelForPrinterUuid(uuid);
}

export function byUserId(clientOrUserId) {
    let userId;
    if (typeof clientOrUserId === 'number') {
        userId = clientOrUserId;
    } else {
        userId = clientOrUserId.userId;
    }
    return getChannelForUser(userId);
}

export function allNot(...rules) {
    return client => {
        let keep = rules.flatMap(rule => rule(client));
        return [...getChannelSet(client)].filter(channel => {
            return !keep.includes(channel);
        });
    };
}

export function byCameraStream(printerUuid, cameraId) {
    return () => getChannelForCamera(printerUuid, cameraId);
}

export function byRpcPrinterInvocation(printerUuid, invocation) {
    return () => {
        let channel = null;
        switch (invocation.command) {
            case RPC_REQUEST_START_CAMERA:
            case RPC_REQUEST_STOP_CAMERA:
                channel = getChannelForCamera(printerUuid, invocation.data.cameraId);
                break;
            case RPC_REQUEST_READ_TEMPERATURES:
            case RPC_REQUEST_STOP_TEMPERATURES:
                channel = getChannelForTemperature(printerUuid);
                break;
            case RPC_REQUEST_RECEIVE_PROGRESS:
            case RPC_REQUEST_STOP_PROGRESS:
                channel = getChannelForProgress(printerUuid);
                break;
        }
        return channel;
    }
}

export function byStatusChangedIfGranted(aclProvider) {
    return async client => {
        let userId = client.userId;
        const event = eventNames[EVENT_SYSTEM_STATUS_CHANGED];
        const acl = await aclProvider.getBroadcastAcl(userId);
        let granted = await acl.canSubscribe(event);
        if (granted) {
            return getChannelForEvent(event)
        }
        return null;
    }
}
