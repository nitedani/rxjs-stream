"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const pipe_1 = require("rxjs/internal/util/pipe");
class StreamingObservable {
    constructor(__stream) {
        this._stream = __stream;
        this._obs = new rxjs_1.Observable((subscriber) => {
            __stream.on('error', (error) => subscriber.error(error));
            __stream.on("end", (_) => subscriber.complete());
            __stream.on("data", (data) => {
                __stream.pause();
                subscriber.next(data);
            });
        });
    }
    pipe() {
        const operations = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        const obs = pipe_1.pipeFromArray(operations)(this._obs);
        return {
            ...obs,
            pipe: this.pipe,
            toPromise: obs.toPromise,
            subscribe: this.subscribe(obs),
        };
    }
    subscribe(observable) {
        return (observer, error, complete) => {
            if (typeof observer === "object") {
                return observable.subscribe({
                    next: (value) => {
                        if (observer.next) {
                            observer.next(value);
                        }
                        this._stream.resume();
                    },
                    error: observer.error,
                    complete: observer.complete,
                });
            }
            else if (typeof observer === "function") {
                return observable.subscribe({
                    next: (value) => {
                        observer(value);
                        this._stream.resume();
                    },
                    error,
                    complete,
                });
            }
            else {
                return observable.subscribe({
                    next: () => {
                        this._stream.resume();
                    },
                    error,
                    complete,
                });
            }
        };
    }
}
StreamingObservable.create = (_stream) => {
    const obs = new StreamingObservable(_stream);
    //@ts-ignore
    return {
        ...obs,
        pipe: obs.pipe.bind(obs),
        subscribe: obs.subscribe(obs._obs),
        toPromise: obs._obs.toPromise,
    };
};
exports.fromReadStream = (_stream) => {
    return StreamingObservable.create(_stream);
};
