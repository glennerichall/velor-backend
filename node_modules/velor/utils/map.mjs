export const MapArrayMixin = Parent => class extends Parent {

    constructor(...args) {
        super(...args);
    }

    get map() {
        return super.map;
    }

    push(key, ...values) {
        let array = this.map.get(key);
        if (!array) {
            array = [];
            this.map.set(key, array);
        }
        array.push(...values);
    }

    find(key, predicate) {
        let array = this.map.get(key);
        if (array) {
            return array.find(predicate);
        }
        return null;
    }

    findIndex(key, predicate) {
        let array = this.map.get(key);
        if (array) {
            return array.findIndex(predicate);
        }
        return -1;
    }

    pop(key, index = undefined) {
        let array = this.map.get(key);
        if (!array) {
            return undefined;
        }
        if (index !== undefined) {
            if (index < array.length) {
                let result = array.splice(index, 1)[0];
                if (array.length === 0) {
                    this.delete(key);
                }
                return result;
            } else {
                return null;
            }
        } else {
            let result = array.pop();
            if (array.length === 0) {
                this.delete(key);
            }
            return result;
        }
    }
}

export const MapMapMixin = Parent => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    get map() {
        return super.map;
    }

    hset(mapName, key, value) {
        let map = this.map.get(mapName);
        if (!map) {
            map = new Map();
            this.map.set(mapName, map);
        }
        map.set(key, value);
    }

    hget(mapName, key) {
        let map = this.map.get(mapName);
        if (map) {
            if (key) {
                return map.get(key);
            }
            return [...map?.values()];
        }
        return undefined;
    }

    hdel(mapName, ...keys) {
        let map = this.map.get(mapName);
        if (map) {
            for (let key of keys) {
                map.delete(key);
            }
            if (map.size === 0) {
                this.map.delete(mapName);
            }
        }
    }
}

export const MapSetMixin = Parent => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    get map() {
        return super.map;
    }

    add(key, ...values) {
        let set = this.map.get(key);
        if (!set) {
            set = new Set();
            this.map.set(key, set);
        }
        for (let value of values) {
            set.add(...values);
        }
    }

    isMember(key, value) {
        let set = this.get(key);
        if (set instanceof Set) {
            return set.has(value);
        } else {
            return false;
        }
    }
}

class MapProviderSelf extends Map {
    get map() {
        return this;
    }
}

class MapProviderHolder {
    #map;

    constructor(map) {
        this.#map = map;
    }

    get map() {
        return this.#map;
    }
}

export const MapArray = MapArrayMixin(MapProviderSelf);
export const MapMap = MapMapMixin(MapProviderSelf);
export const MapSet = MapSetMixin(MapProviderSelf);