export function chainHandlers(...handlers) {
    return (req, res, next) => handlers
        .slice()
        .reverse()
        .reduce((next, handler) => {
            return (err) => {
                let n = handler.length;
                if (err) {
                    if (n === 4) {
                        handler(err, req, res, next);
                    } else {
                        next(err);
                    }
                } else {
                    if (n <= 3) {
                        handler(req, res, next);
                    } else {
                        next();
                    }
                }
            };
        }, next)();
}