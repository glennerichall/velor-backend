import {cartesian} from "velor/utils/collection.mjs";


export function getSortingValues(columns) {
    let res = cartesian(columns,
        [
            "",
            " asc",
            " desc"
        ]).map(x => x.join(''));
    res.push('');
    return res;
}