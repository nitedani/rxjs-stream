import { identity, Observable, OperatorFunction } from "rxjs";
import { pipeFromArray } from "rxjs/internal/util/pipe";
import stream from "stream";

export const fromReadStream = <T>(_stream: stream.Readable) => {
  const _obs = new Observable<T>((subscriber) => {
    _stream.on("data", (data) => {
      _stream.pause();
      subscriber.next(data);
    });
  });

  const pipe = <A, B, C, D, E, F, G, H, I>(
    op1?: OperatorFunction<T, A>,
    op2?: OperatorFunction<A, B>,
    op3?: OperatorFunction<B, C>,
    op4?: OperatorFunction<C, D>,
    op5?: OperatorFunction<D, E>,
    op6?: OperatorFunction<E, F>,
    op7?: OperatorFunction<F, G>,
    op8?: OperatorFunction<G, H>,
    op9?: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): any => {
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
    ].filter(identity) as OperatorFunction<any, any>[];
    const obs = pipeFromArray(_operations)(_obs);
    return {
      ...obs,
      pipe,
      toPromise: obs.toPromise.bind(obs),
      subscribe: subscribe(obs).bind(obs),
    };
  };

  const subscribe = (observable: Observable<any>) => (
    observer?:
      | {
          next?: (value: T) => void;
          error?: (error: any) => void;
          complete?: () => void;
        }
      | ((next?: T) => void)
  ) => {
    if (typeof observer === "object") {
      return observable.subscribe({
        next: (value: T) => {
          if (observer.next) {
            observer.next(value);
          }
          _stream.resume();
        },
        error: observer.error,
        complete: observer.complete,
      });
    } else if (typeof observer === "function") {
      return observable.subscribe({
        next: (value: T) => {
          observer(value);
          _stream.resume();
        },
      });
    } else {
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
