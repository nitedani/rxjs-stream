"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const pipe_1 = require("rxjs/internal/util/pipe");
exports.fromReadStream = (_stream) => {
    const _obs = new rxjs_1.Observable((subscriber) => {
        _stream.on("data", (data) => {
            _stream.pause();
            subscriber.next(data);
        });
    });
    const pipe = (op1, op2, op3, op4, op5, op6, op7, op8, op9, ...operations) => {
        const _operations = [
            op1,
            op2,
            op3,
            op4,
            op5,
            op6,
            op7,
            op8,
            op9,
            ...operations,
        ].filter(rxjs_1.identity);
        const obs = pipe_1.pipeFromArray(_operations)(_obs);
        return {
            ...obs,
            pipe,
            toPromise: obs.toPromise.bind(obs),
            subscribe: subscribe(obs).bind(obs),
        };
    };
    const subscribe = (observable) => (observer) => {
        if (typeof observer === "object") {
            return observable.subscribe({
                next: (value) => {
                    if (observer.next) {
                        observer.next(value);
                    }
                    _stream.resume();
                },
                error: observer.error,
                complete: observer.complete,
            });
        }
        else if (typeof observer === "function") {
            return observable.subscribe({
                next: (value) => {
                    observer(value);
                    _stream.resume();
                },
            });
        }
        else {
            return observable.subscribe((_) => _stream.resume());
        }
    };
    return {
        ..._obs,
        pipe,
        toPromise: _obs.toPromise.bind(_obs),
        subscribe: subscribe(_obs).bind(_obs),
    };
};
