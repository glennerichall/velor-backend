export function allable(collection) {
    const handler = {
        get(target, prop, receiver) {
            if (prop === Symbol.iterator) {
                return function* () {
                    for (let element of collection) {
                        yield element;
                    }
                }
            } else if (prop === Symbol.toPrimitive) {
                return function (hint) {
                    return collection;
                }
            } else if (prop === Symbol.toStringTag) {
                return collection.toString();

            } else if (prop === "length") {
                return collection.length;

            } else {
                const result = collection.map(element => element[prop]);
                return allable(result);
            }
        },
        apply(target, thisArg, argumentList) {
            const result = collection.map(element => element(...argumentList));
            return allable(result);
        },
    };

    return new Proxy(() => {
    }, handler);
}