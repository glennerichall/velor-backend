import fsModule from "fs";
import pathModule from "path";
import childProcessModule from "child_process";

let fs = fsModule;
let path = pathModule;
let cp = childProcessModule;

export function setChildProcess(cpMock) {
    cp = cpMock;
}

export function restoreChildProcess() {
    setChildProcess(childProcessModule);
}

export function getChildProcess() {
    return cp;
}

export function setFS(fsMock) {
    fs = fsMock;
}

export function restoreFS() {
    setFS(fsModule)
}

export function getFSAsync() {
    return fs.promises;
}

export function getFS() {
    return fs;
}

export function getPath() {
    return path;
}

export function setPath(pathMock) {
    path = pathMock;
}

export function restorePath() {
    setPath(pathModule);
}