import {
    MAX_RANDOM_INT,
    randomInt
} from "velor-utils/utils/platform.mjs";
import {
    packInts,
    unpackInts
} from "velor-utils/utils/math.mjs";

export const MAX_SERVERS = 10000;

export function getNewId(serverId) {
    let min = MAX_SERVERS + 1;
    let id = randomInt(Math.floor(MAX_RANDOM_INT / MAX_SERVERS) - min);
    return packInts(id, serverId, MAX_SERVERS);
}

export function unpackId(packedInt) {
    const {
        int1: id,
        int2: serverId
    } = unpackInts(packedInt, MAX_SERVERS);
    return {id, serverId};
}