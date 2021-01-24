import { Observable, OperatorFunction } from "rxjs";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import stream from "stream";

class StreamingObservable<T> {
  //@ts-ignore
  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Observable<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Observable<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): Observable<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Observable<I>;
  //@ts-ignore
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Observable<{}>;

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
      pipe: this.pipe,
      toPromise: obs.toPromise,
      subscribe: this.subscribe(obs),
    };
  }
  static create = <T>(_stream: stream.Readable): Observable<T> => {
    const obs = new StreamingObservable<T>(_stream);
    //@ts-ignore
    return {
      ...obs,
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
      __stream.on('error', (error) => subscriber.error(error));
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
