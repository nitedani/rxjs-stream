Currently this package has one function:<br> `fromReadStream<T>(readStream:stream.Readable): Observable<T>`
<br>
<br>
`fromReadStream` creates an rxjs observable from a node readstream with backpressure support.
<br>
How it works: the underlying readstream is paused whenever a new chunk is read, and resumed after the value is emitted and processed by the observer.
<br>
<br>
Example:
```
const rs = createReadStream("huge_file.txt");
fromReadStream<string>(rs)
  .pipe(
    tap((chunk) => {
      console.log("Processing chunk...", chunk);
    }),
    map((chunk) => chunk.toLowerCase()),
    delay(1000)
  )
  .subscribe((chunk) => console.log(chunk));
```