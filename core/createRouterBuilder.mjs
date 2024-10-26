import express from "express";
import {tryCatchAsyncHandler} from "./tryCatchAsyncHandler.mjs";

const names = [];

class RouterBuilder {
    constructor(router, options) {
        this._router = router;
        this._name = null;
        this._options = options;
    }

    use(path, ...handlers) {
        if (typeof path === 'function') {
            this._router.use(tryCatchAsyncHandler(path), ...tryCatchAsyncHandler(handlers, this._name));
        } else {
            this._router.use(path, ...tryCatchAsyncHandler(handlers, this._name));
        }
        this._name = null;
        return this;
    }

    all(path, ...handlers) {
        this._router.all(path, ...tryCatchAsyncHandler(handlers, this._name));
        this._name = null;
        return this;
    }

    get(path, ...handlers) {
        this._router.get(path, ...tryCatchAsyncHandler(handlers, this._name));
        this._name = null;
        return this;
    }

    post(path, ...handlers) {
        this._router.post(path, ...tryCatchAsyncHandler(handlers, this._name));
        this._name = null;
        return this;
    }

    put(path, ...handlers) {
        this._router.put(path, ...tryCatchAsyncHandler(handlers, this._name));
        this._name = null;
        return this;
    }

    delete(path, ...handlers) {
        this._router.delete(path, ...tryCatchAsyncHandler(handlers, this._name));
        this._name = null;
        return this;
    }

    options(path, ...handlers) {
        this._router.options(path, ...tryCatchAsyncHandler(handlers));
        this._name = null;
        return this;
    }

    route(path, callback) {
        callback(this._router.route(path));
        this._name = null;
        return this;
    }

    name(name) {
        this._name = name;
        names.push(name);
        return this;
    }

    configure(configuration = []) {

        // use and options must be declared first
        let methods = ['use', 'options', 'get', 'post', 'put', 'delete'];

        for (let route of configuration) {

            if (typeof route === 'function') {
                this.use(route);
                continue;
            }

            for (let method of methods) {
                if (route[method]) {
                    let handlers = route[method];
                    if (!Array.isArray(handlers)) {
                        handlers = [handlers];
                    }
                    if (route.name) {
                        this.name(route.name);
                    }
                    this[method](route.path, ...handlers);
                }
            }

            if (route.router) {
                const {
                    newRouter = express.Router,
                } = this._options;

                const subRouter = createRouterBuilder({
                    configuration: route.router,
                    newRouter
                }).done();
                if (route.path) {
                    this.use(route.path, subRouter);
                } else {
                    this.use(subRouter);
                }
            }
        }

        return this;
    }

    done() {
        return this._router;
    }
}

export function createRouterBuilder(args = {}) {

    const {
        newRouter = express.Router,
    } = args;

    const {
        router = newRouter(),
        configuration = []
    } = args;

    const builder = new RouterBuilder(router, args);
    builder.configure(configuration);

    return builder;
}