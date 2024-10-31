import {PROCESS_FILE} from "../../shared/constants/queues.mjs";


export class FileReceiver {
    constructor(fileManagers, queue) {
        this._fileManagers = fileManagers;
        this._queue = queue;
    }

    async receiveFile(info) {
        const {bucketname, bucket} = info;

        const file = await this._fileManagers[bucket]()
            .setFileAvailable(bucketname);

        if (file) {
            await this._queue.submit(PROCESS_FILE,
                {bucketname, bucket}, {jobId: bucketname});
            return true;
        }

        return false;
    }
}