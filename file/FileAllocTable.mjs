export class FileAllocTable {
    constructor(database) {
        this._db = database;
    }

    _getOperations(database) {
        const createEntry = async (bucket, bucketname) => database.files.createFile(bucket, bucketname);
        const setAvailable = bucketname => database.files.updateSetUploaded(bucketname);
        const deleteEntry = bucketname => database.files.deleteByBucketname(bucketname);
        const deleteEntries = bucketnames => database.files.deleteByBucketnames(bucketnames);
        const keepEntries = bucketnames => database.files.keepByBucketnames(bucketnames);
        const setRejected = (bucketname, size, hash) => database.files.updateSetRejected(bucketname, size, hash);
        const setReady = (bucketname, size, hash) => database.files.updateSetDone(bucketname, size, hash);
        const setStatus = (bucketname, status, size, hash) => database.files.updateSetStatus(bucketname, size, hash, status);
        const setCreation = (bucketname, creation) => database.files.updateSetDatetime(bucketname, creation);
        const getUnprocessedEntries = (numDays) => database.files.queryForUnprocessed(numDays);
        const getEntriesByHash = hash => database.files.queryFilesByHash(hash);
        const removeEntries = deleteEntries;

        return {
            createEntry,
            setAvailable,
            setStatus,
            deleteEntry,
            deleteEntries,
            removeEntries,
            keepEntries,
            setRejected,
            setCreation,
            setReady,
            getUnprocessedEntries,
            getEntriesByHash,
        }
    }

    transact(callback) {
        return this._db.transact(db => {
            return callback(this._getOperations(db));
        })
    }

    open() {
        return this._getOperations(this._db);
    }

}