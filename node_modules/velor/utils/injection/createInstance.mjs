export function createInstance(Clazz) {
    return (services, ...args) => {
        return new Clazz(...args);
    }
}