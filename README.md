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
import { createReadStream } from "fs";
import { fromReadStream } from "@nitedani/rxjs-stream";
import { delay, tap, map } from "rxjs/operators";
const rs = createReadStream("huge_file.txt",{
  encoding: "utf-8",
});
fromReadStream<string>(rs)
  .pipe(
    tap(() => {
      console.log("Processing chunk...");
    }),
    map((chunk) => chunk.toLowerCase()),
    delay(1000)
  )
  .subscribe((chunk) => console.log(chunk));
```
Processing large json array with [stream-json](https://www.npmjs.com/package/stream-json):
```
import { createReadStream } from "fs";
import { fromReadStream } from "@nitedani/rxjs-stream";
import { delay, tap } from "rxjs/operators";
import { withParser } from "stream-json/streamers/StreamArray";
const rs = createReadStream("huge_array.json", {
  encoding: "utf-8",
});
const jsonStream = rs.pipe(withParser());
fromReadStream(jsonStream)
  .pipe(
    tap(() => {
      console.log("Processing chunk...");
    }),
    delay(1000)
  )
  .subscribe({
    next: (chunk) => console.log(chunk),
    complete: () => {
      console.log("complete");
    },
  });
  ```
  Processing large csv file with [fast-csv](https://www.npmjs.com/package/fast-csv): 
  ```
  import { createReadStream } from "fs";
import { fromReadStream } from "@nitedani/rxjs-stream";
import { delay, tap } from "rxjs/operators";
import { parse } from "fast-csv";
const rs = createReadStream("huge_csv.csv");
const csvStream = rs.pipe(parse({ headers: true }));
fromReadStream(csvStream)
  .pipe(
    tap(() => {
      console.log("Processing chunk...");
    }),
    delay(1000)
  )
  .subscribe({
    next: (chunk) => console.log(chunk),
    complete: () => {
      console.log("complete");
    },
  });
  ```
