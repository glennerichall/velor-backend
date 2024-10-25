export function promisifyMiddleware(middleware) {
    return (req) =>
        new Promise((resolve, reject) => {
            middleware(req, {}, () => resolve(req));
        });
}