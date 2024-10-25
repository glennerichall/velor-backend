import cookieSession from "cookie-session";
import corsMiddleware from "cors";
import {getEnvValue, getEnvValues} from "velor/utils/injection/baseServices.mjs";
import {BACKEND_ALLOW_CORS, SAME_SITE, SESSION_SECRET1, SESSION_SECRET2} from "./envKeys.mjs";

export const pauseHandler = (req, res, next) => {
    if (req.app.get('paused')) {
        return res.status(503).send('Server is temporarily unavailable.');
    }
    next();
}

export const createSessionParserInstance = services => {
    let now = new Date();

    const [secret1, secret2, sameSite] = getEnvValues(services,
        SESSION_SECRET1, SESSION_SECRET2, SAME_SITE);

    return cookieSession({
        name: 'session',
        keys: [
            secret1,
            secret2
        ],
        expires: new Date(now.getFullYear() + 100, now.getMonth(), now.getDate()),
        sameSite,
        secure: true,
    });
};

export const corsProvider = services => {
    const allowCors = getEnvValue(services, BACKEND_ALLOW_CORS);

    return corsMiddleware(
        {
            origin: allowCors.split(';'),
            credentials: true
        }
    );
};
