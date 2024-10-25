export function expressRouteToRegExp(route) {
    // Escape special RegExp characters
    let regExpRoute = route.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    // Special handling for port
    regExpRoute = regExpRoute.replace(/:(\d+)/g, ':(?<port>\\d+)');

    // Convert named parameters (e.g., :userId) to RegExp groups with names
    regExpRoute = regExpRoute.replace(/:(\w+)/g, '(?<$1>[^\/]+)');

    // Handle optional parameters
    regExpRoute = regExpRoute.replace(/\/\([^\/]+\)\?/g, '(?:\/([^\/]+))?');

    // Convert wildcard (*) to RegExp equivalent
    regExpRoute = regExpRoute.replace(/\*/g, '.*');

    // Add start and end line anchors
    regExpRoute = '^' + regExpRoute + '$';

    return new RegExp(regExpRoute);
}