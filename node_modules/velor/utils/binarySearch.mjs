export function binarySearchNearest(data, value) {
    let low = 0;
    let high = data.length - 1;
    let mid, midValue;

    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        midValue = data[mid];

        if (midValue < value) {
            low = mid + 1;
        } else if (midValue > value) {
            high = mid - 1;
        } else {
            return mid; // Exact match found
        }
    }

    // Return the index of the closest element if exact match not found
    if (low < data.length && high >= 0) {
        const lowDiff = Math.abs(value - data[low]);
        const highDiff = Math.abs(value - data[high]);
        return lowDiff <= highDiff ? low : high;
    }

    return low < data.length ? low : high;
}

export function binarySearchNearestX(data, value) {
    let low = 0;
    let high = data.length - 1;
    let mid, midValue;

    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        midValue = data[mid].x;

        if (midValue < value) {
            low = mid + 1;
        } else if (midValue > value) {
            high = mid - 1;
        } else {
            return mid; // Exact match found
        }
    }

    // Return the index of the closest element if exact match not found
    if (low < data.length && high >= 0) {
        const lowDiff = Math.abs(value - data[low].x);
        const highDiff = Math.abs(value - data[high].x);
        return lowDiff <= highDiff ? low : high;
    }

    return low < data.length ? low : high;
}

export function binarySearch(data, value) {
    let start = 0;
    let end = data.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (data[middle] === value) {
            // found the index
            return middle;
        } else if (data[middle] < value) {
            // continue searching to the right
            start = middle + 1;
        } else {
            // continue searching to the left
            end = middle - 1;
        }
    }
    // index wasn't found
    return end;
}