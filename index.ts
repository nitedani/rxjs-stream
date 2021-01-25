import { Observable, OperatorFunction } from "rxjs";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import stream from "stream";

class StreamingObservable<T> {
  pipe() {
    const operations: OperatorFunction<any, any>[] = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    if (operations.length === 0) {
      return this;
    }
    const obs = pipeFromArray(operations)(this._obs);
    return {
      ...obs,
      //pipe: this.pipe, I don't know how to do pipe chaining, please help rewrite this mess :) 
    
      toPromise: obs.toPromise,
      subscribe: this.subscribe(obs),
    };
  }
  static create = <T>(_stream: stream.Readable): Observable<T> => {
    const obs = new StreamingObservable<T>(_stream);

    return {
      ...obs,
      //@ts-ignore
      pipe: obs.pipe.bind(obs),
      subscribe: obs.subscribe(obs._obs),
      toPromise: obs._obs.toPromise,
    };
  };

  _stream: stream.Readable;
  _obs: Observable<T>;
  constructor(__stream: stream.Readable) {
    this._stream = __stream;
    this._obs = new Observable<T>((subscriber) => {
      __stream.on("error", (error) => subscriber.error(error));
      __stream.on("end", (_: any) => subscriber.complete());
      __stream.on("data", (data) => {
        __stream.pause();
        subscriber.next(data);
      });
    });
  }

  subscribe(observable: Observable<T>) {
    return (observer?: any, error?: any, complete?: any) => {
      if (typeof observer === "object") {
        return observable.subscribe({
          next: (value: T) => {
            if (observer.next) {
              observer.next(value);
            }
            this._stream.resume();
          },
          error: observer.error,
          complete: observer.complete,
        });
      } else if (typeof observer === "function") {
        return observable.subscribe({
          next: (value: T) => {
            observer(value);
            this._stream.resume();
          },
          error,
          complete,
        });
      } else {
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
export const fromReadStream = <T>(_stream: stream.Readable) => {
  return StreamingObservable.create<T>(_stream);
};
