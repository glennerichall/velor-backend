import {
    EVENT_FILE_PROCESSED,
    EVENT_FILE_REMOVED,
    EVENT_FILE_UPLOADED,
    EVENT_FILES_PURGED,
    EVENT_LOGGED_IN,
    EVENT_LOGGED_OUT,
    EVENT_NEW_FILE_CREATED,
    EVENT_PRINTER_LINKED,
    EVENT_PRINTER_OFFLINE,
    EVENT_PRINTER_ONLINE,
    EVENT_PRINTER_TITLE_CHANGED,
    EVENT_PRINTER_UNLINKED,
    EVENT_PENDING_FILE_ABORTED,
    EVENT_PREFERENCES_CHANGED,
    EVENT_SYSTEM_STATUS_CHANGED,
    EVENT_APIKEY_CREATED,
    EVENT_APIKEY_DELETED,
    EVENT_PRINTER_PROGRESS,
    EVENT_NOTIFICATION_INFO,
    EVENT_NOTIFICATION_WARNING,
    EVENT_WS_CONNECTION,
    EVENT_FETCH_DONE,
    EVENT_NOTIFICATION_ERROR,
    EVENT_NOTIFICATION_SUCCESS,
} from "../../shared/constants/events.mjs";
import {
    RPC_REQUEST_STREAM,
    RPC_REQUIRE_LOGIN
} from "../../shared/constants/commands.mjs";
import {getLogger} from "velor/utils/injection/services.mjs";
import {eventNames} from "../../shared/constants/eventNames.mjs";

function trim(entries) {
    return entries.map(entry => {
        const {
            filename, bucketname, bucket
        } = entry;
        return {filename, bucketname, bucket};
    });
}

export class FrontendMessageFactory {
    #builder;
    
    constructor(builder) {
        this.#builder = builder;
    }

    emitEvent(event, data) {
        getLogger(this).debug(`Creating new event ${eventNames[event]}`);
        return this.#builder.newEvent(event, data);
    }

    invokeRpc(command, data) {
        return this.#builder.newCommand(command, data);
    }

    systemStatusChanged() {
        return this.emitEvent(EVENT_SYSTEM_STATUS_CHANGED);
    }

    apiKeyCreated(apiKey) {
        return this.emitEvent(EVENT_APIKEY_CREATED, {apiKey});
    }

    apiKeyDeleted(apiKey) {
        return this.emitEvent(EVENT_APIKEY_DELETED, {apiKey});
    }

    requireLogin(url) {
        return this.invokeRpc(RPC_REQUIRE_LOGIN, {url});
    }

    loggedOut() {
        return this.emitEvent(EVENT_LOGGED_OUT);
    }

    loggedIn() {
        return this.emitEvent(EVENT_LOGGED_IN);
    }

    warning(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_WARNING, {message, duration});
    }

    error(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_ERROR, {message, duration});
    }

    info(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_INFO, {message, duration});
    }

    success(message, duration) {
        return this.emitEvent(EVENT_NOTIFICATION_SUCCESS, {message, duration});
    }

    notification(message, duration, type) {
        switch (type) {
            case 'warning':
                return this.warning(message, duration);
            case 'info':
                return this.info(message, duration);
            case 'error':
                return this.error(message, duration);
            case 'success':
                return this.success(message, duration);
        }
    }

    fileCreated({bucketname, bucket}) {
        return this.emitEvent(EVENT_NEW_FILE_CREATED, {bucketname, bucket});
    }

    fileUploaded({bucketname, bucket}) {
        return this.emitEvent(EVENT_FILE_UPLOADED, {bucketname, bucket});
    }

    // filename is optional
    // uuid is optional
    fileProcessed({bucketname, bucket, status, filename, uuid}) {
        return this.emitEvent(EVENT_FILE_PROCESSED, {bucket, bucketname, status, filename, uuid});
    }

    filesAborted(files) {
        files = trim(files);
        return this.emitEvent(EVENT_PENDING_FILE_ABORTED, {files});
    }

    filesDeleted(files) {
        files = trim(files);
        return this.emitEvent(EVENT_FILE_REMOVED, {files});
    }

    filesPurged(files) {
        files = trim(files);
        return this.emitEvent(EVENT_FILES_PURGED, {files});
    }

    preferencesChanged(name) {
        return this.emitEvent(EVENT_PREFERENCES_CHANGED, {name});
    }

    printerLinked(instance) {
        return this.printerEvent(instance, EVENT_PRINTER_LINKED);
    }

    printerUnlinked(instance) {
        return this.printerEvent(instance, EVENT_PRINTER_UNLINKED);
    }

    printerOnline(instance) {
        return this.printerEvent(instance, EVENT_PRINTER_ONLINE);
    }

    printerOffline(instance) {
        return this.printerEvent(instance, EVENT_PRINTER_OFFLINE);
    }

    printerTitleChanged(instance) {
        return this.printerEvent(instance, EVENT_PRINTER_TITLE_CHANGED);
    }

    printerEvent(instance, event, payload = {}) {
        const {
            uuid,
            name
        } = instance;
        return this.emitEvent(event,
            {
                uuid,
                name,
                payload
            });
    }

    printerProgress(instance, progress) {
        return this.printerEvent(instance, EVENT_PRINTER_PROGRESS, progress);
    }

    sendWsId(wsId) {
        return this.emitEvent(EVENT_WS_CONNECTION, {wsId});
    }

    readStream(type, data, streamId) {
        return this.invokeRpc(RPC_REQUEST_STREAM, {type, data, streamId});
    }

    requestDone(id, url, status) {
        return this.emitEvent(EVENT_FETCH_DONE, {id, url, status});
    }

}