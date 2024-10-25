export function any(...predicates) {
    return (...args) => {
        // use a for loop to create a lazy eval OR
        for (let predicate of predicates) {
            if (predicate(...args)) {
                return true;
            }
        }
        return false;
    }
}

export function all(...predicates) {
    return (...args) => {
        // use a for loop to create a lazy eval AND
        for (let predicate of predicates) {
            if (!predicate(...args)) {
                return false;
            }
        }
        return true;
    }
}

export function not(predicate) {
    return (...args) => !predicate(...args);
}

export function anyAsync(...predicates) {
    return async (...args) => {
        // use a for loop to create a lazy eval OR
        for (let predicate of predicates) {
            if (await predicate(...args)) {
                return true;
            }
        }
        return false;
    }
}

export function allAsync(...predicates) {
    return async (...args) => {
        // use a for loop to create a lazy eval AND
        for (let predicate of predicates) {
            if (!await predicate(...args)) {
                return false;
            }
        }
        return true;
    }
}

export function notAsync(predicate) {
    return async (...args) => !await predicate(...args);
}

export function isTrue(value){
    return value === "true" || value === true;
}