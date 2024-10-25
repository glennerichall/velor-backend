export const InitializableMixin = (Parent, initialize) => class extends Parent {
    constructor(...args) {
        super(...args);
    }

    initialize() {
        return initialize(this);
    }
}