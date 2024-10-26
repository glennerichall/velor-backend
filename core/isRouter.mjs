export function isRouter(router) {
    return typeof router === 'function' &&
        Array.isArray(router.stack) &&
        typeof router.params === 'object' &&
        router.length === 3;
}