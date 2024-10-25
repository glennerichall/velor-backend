import path from "path";
import os from "os";
import archiver from "archiver";
import extract from "extract-zip";
import {
    getFSAsync
} from "./sysProvider.mjs";

export async function getTempDir() {
    return getFSAsync().mkdtemp(path.resolve(os.tmpdir()) + path.sep);
}

export async function zipFiles(outputStream, files) {
    const archive = archiver('zip');
    archive.pipe(outputStream);

    const promises = files.map(async file => {
        const {
            data,
            name
        } = await file;
        archive.append(data, {name: name});
    });

    await Promise.all(promises);
    await archive.finalize();

    return new Promise((resolve, reject) => {
        outputStream.on('close', resolve);
        archive.on('error', reject);
    });
}

export async function extractZip(zipFilePath, directory) {
    await extract(zipFilePath, {dir: directory})
}