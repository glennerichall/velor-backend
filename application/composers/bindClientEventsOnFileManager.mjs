import {
    bindOnAfterMethods,
} from "velor/utils/proxy.mjs";

function groupByOwner(entries) {
    let map = new Map();
    for (let entry of entries) {
        let list = map.get(entry.user_id);
        if (!list) {
            list = [];
            map.set(entry.user_id, list);
        }
        list.push(entry);
    }
    return map;
}

export function bindClientEventsOnFileManager(fileManager, getEmitter) {

    const observer = {
        async onCreateEntry(result) {
            const {entry} = await result;
            const emit = await getEmitter(entry.user_id);
            emit.fileCreated(entry);
        },

        async onDeleteFiles(result) {
            const entries = await result;
            let map = groupByOwner(entries);
            for (let key of map.keys()) {
                const emit = await getEmitter(key);
                emit.filesDeleted(map.get(key));
            }
        },

        async onSetFileAvailable(result, target, ...args) {
            let entry = await result;
            if (entry) {
                const emit = await getEmitter(entry.user_id)
                emit.fileUploaded(entry);
            }
        },

        async onRemoveFiles(result) {
            const entries = await result;
            let map = groupByOwner(entries);
            for (let key of map.keys()) {
                const emit = await getEmitter(key);
                emit.filesDeleted(map.get(key));
            }
        },

        async onProcessFile(result) {
            let {entry} = await result;
            if (entry) { // the entry may not exist if it was deleted
                const emit = await getEmitter(entry.user_id);
                emit.fileProcessed(entry);
            }
        }
    };

    return bindOnAfterMethods(fileManager, observer);
}