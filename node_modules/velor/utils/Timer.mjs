export class Timer {
    constructor() {
        this.start();
        this._frames = 0;
    }

    start() {
        this._frames = 0;
        this._start = new Date();
    }

    span() {
        return this._stop.getTime() - this._start.getTime();
    }

    elapsed() {
        return new Date() - this._start;
    }

    ping() {
        this._frames++;
    }

    fps() {
        let elapsed = this.elapsed();
        return Math.round(1000/elapsed * this._frames);
    }

    restart() {
        let elapsed = this.stop();
        this.start();
        return elapsed;
    }

    stop(msg) {
        this._stop = new Date();
        if (msg) {
            if (process.env.FRONTEND_LOGGING_ENABLED === "true") {
                console.debug('[Timer]', `${msg} in ${this.span()} ms`);
            }
        }
        return this.span();
    }

    static instance = new Timer();
}