import {
    ERROR_FILE_ALREADY_PROCESSED,
    ERROR_FILE_INFECTED,
    ERROR_FILE_INVALID,
    ERROR_FILE_NOT_FOUND,
    ERROR_FILE_UPLOAD_FAILED,
    SUCCESS_FILE_PROCESSED,
    SUCCESS_FILE_VALIDATED
} from "./errors.mjs";

import {getLogger} from "velor-utils/utils/injection/services.mjs";

export class FileManager {
    constructor(alloctable, filestore) {
        this._fs = filestore;
        this._table = alloctable;
    }

    get fileStore() {
        return this._fs;
    }

    async createEntry(...args) {
        return this._table.transact(async ({createEntry}) => {
            const entry = await createEntry(...args);
            const uploadURL = await this._fs.getPostUrl(entry.bucketname);
            return {
                entry,
                uploadURL
            };
        });
    }

    async getFileSignedUrl(bucketname) {
        return this._fs.getSignedUrl(bucketname);
    }

    async deleteFiles(...bucketnames) {
        return this._table.transact(async ({deleteEntries}) => {
            const entries = await deleteEntries(bucketnames);
            const ok = await this._fs.deleteObjects(bucketnames);
            if (!ok) {
                throw new Error("unable to delete file from store");
            }
            return entries;
        });
    }

    async removeFiles(...bucketnames) {
        const {removeEntries} = this._table.open();
        return removeEntries(bucketnames);
    }

    async setFileAvailable(bucketname) {
        const {setAvailable} = this._table.open();
        return setAvailable(bucketname);
    }

    async setFileStatus(bucketname, status, size, hash) {
        const {setStatus} = this._table.open();
        return setStatus(bucketname, status, size, hash);
    }

    async setFileRejected(bucketname, size, hash) {
        const {setRejected} = this._table.open();
        return setRejected(bucketname, size, hash);
    }

    async getEntries(bucketnames) {
        const {getEntries, getAllEntries} = this._table.open();
        return bucketnames ? getEntries(bucketnames) : getAllEntries();
    }

    async getEntriesByHash(hash) {
        const {getEntriesByHash} = this._table.open();
        return getEntriesByHash(hash);
    }

    async readFile(bucketname) {
        return this._fs.getObject(bucketname);
    }

    async updateCreationTime(bucketname, datetime = new Date()) {
        const {setCreation} = this._table.open();
        return setCreation(bucketname, datetime);
    }

    async cleanFileStore() {

        getLogger(this).info(`Removing files from S3 not in database`);

        await this._table.transact(async ({getAllEntries}) => {

            getLogger(this).info('Getting all files from database');

            const entries = await getAllEntries();
            const bucketnames = entries.map(x => x.bucketname);

            if (entries.length > 0) {
                getLogger(this).info(`${bucketnames.length} file(s) in database`);
            } else {
                getLogger(this).info('No file in database, removing all files from S3');
            }

            let files = await this._fs.listObjects();
            if (files === null) {
                console.error(`Unable to list files from S3`);
            }


            if (files.length > 0) {
                getLogger(this).info(`${files.length} file(s) in S3`);
            } else {
                getLogger(this).info('No file in S3');
            }


            // find bucket files not in database
            const toRemove = [];
            for (let file of files) {
                if (!bucketnames.includes(file)) {
                    toRemove.push(file);
                }
            }

            // remove them from s3
            if (toRemove.length > 0) {

                getLogger(this).info(`Removing ${toRemove.length} file(s) from S3`)

                const ok = await this._fs.deleteObjects(toRemove);
                if (!ok) {
                    console.error(`Unable to remove ${toRemove.length} file(s) from S3`);
                }
            } else {
                getLogger(this).info(`No file to remove, all clean`);
            }
        });
    }

    async cleanDatabase() {

        getLogger(this).info('Cleaning database for files not in S3');
        getLogger(this).info('Listing files from S3');

        const bucketnames = await this._fs.listObjects();
        if (bucketnames === null) {
            console.error('Unable to list files from S3');
        }

        await this._table.transact(async ({deleteAllEntries, keepEntries}) => {
            let result;

            // remove database files not in s3 bucket
            if (bucketnames.length === 0) {
                getLogger(this).info('No files in S3, purging all files from database');

                result = await deleteAllEntries();
            } else {
                result = await keepEntries(bucketnames);
            }

            if (result > 0) {
                getLogger(this).info(`Removed ${result} files from database`);
            } else {
                getLogger(this).info('No file to remove, all clean');
            }
        });
    }

    async cleanOldFiles({numDays = 3} = {}) {
        getLogger(this).info(`Cleaning database from old files not uploaded since ${numDays} day(s)`);

        await this._table.transact(async ({deleteOldEntries}) => {
            const result = await deleteOldEntries(numDays);
            if (result > 0) {
                getLogger(this).info(`Deleted ${result} file(s) from database that where not uploaded more than ${numDays} days ago`);
            } else {
                getLogger(this).info('No file to remove, all clean');
            }
        });
    }

    async processMissedNewFiles({numDays = 3} = {}) {
        // process files that were not processed for validation
        getLogger(this).info(`Processing files that were not processed for validation since ${numDays} day(s)`);

        // Do not run in a transaction as this takes a long time
        // and we want every file to be updated in the database
        // file by file and not in batch so if it fails somehow
        // we do not need to update from beginning.

        const {getUnprocessedEntries} = this._table.open();
        const entries = await getUnprocessedEntries(numDays);

        if (entries.length > 0) {
            getLogger(this).info(`Starting process of ${entries.length} pending file(s)`);
        } else {
            getLogger(this).info(`Not file to process, all clean`);
        }

        let accepted = [], rejected = [], notFound = [];
        let i = 0;
        for (let {bucketname} of entries) {
            i++;

            const {status} = await this.processFile(bucketname);

            switch (status) {
                case SUCCESS_FILE_PROCESSED:
                    accepted.push(bucketname);
                    break;
                case ERROR_FILE_UPLOAD_FAILED:
                case ERROR_FILE_NOT_FOUND:
                    notFound.push(bucketname);
                    break;
                case ERROR_FILE_INFECTED:
                case ERROR_FILE_INVALID:
                    rejected.push(bucketname);
                    break;
            }

            getLogger(this).info(`(${i}/${entries.length})\t\t${bucketname}\t${status}`);
        }

        if (entries.length > 0) {
            getLogger(this).info(`Processed ${entries.length} file(s) with ${accepted.length} accepted file(s) and ${rejected.length} rejected file(s)`);
        }
    }

    async _validateFile(entry, file) {
        return SUCCESS_FILE_VALIDATED;
    }

    async _processFile(entry, file) {
        return SUCCESS_FILE_PROCESSED;
    }

    async processFile(bucketname) {
        const {
            deleteEntry, setRejected,
            setReady, getEntry
        } = this._table.open();

        let entry = await getEntry(bucketname);

        if (!entry) {
            return {
                status: ERROR_FILE_NOT_FOUND,
                bucketname
            };
        }

        if (entry.status === 'ready' || entry.status === 'rejected') {
            return {
                status: ERROR_FILE_ALREADY_PROCESSED,
                entry
            };
        }

        const file = await this._fs.getObject(bucketname);

        if (file === null) {
            await deleteEntry(bucketname);
            return {
                status: ERROR_FILE_NOT_FOUND,
                entry
            };
        }

        let status = await this._validateFile(entry, file);

        switch (status) {
            case ERROR_FILE_INFECTED:
            case ERROR_FILE_INVALID:
                await setRejected(bucketname, file.size, file.hash);
                return {
                    status,
                    entry
                };
        }

        status = await this._processFile(entry, file);

        // the size and hash may have changed after processing.
        const info = await this._fs.getObjectInfo(bucketname);

        if (status === SUCCESS_FILE_PROCESSED) {
            await setReady(bucketname, info.size, info.hash);
            entry = await getEntry(bucketname);
        }

        return {
            status,
            entry
        };
    }

}

