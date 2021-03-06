const { createReadStream } = require("fs");
const { fromReadStream } = require("../index");
const { map, delay } = require("rxjs/operators");
const { tap } = require("rxjs/internal/operators/tap");

const rs = createReadStream("examples/example1.input.txt", {
  encoding: "utf-8",
  highWaterMark: 8,
});

fromReadStream(rs)
  .pipe(
    tap((chunk) => {
      console.log("Processing chunk...", chunk);
    }),
    map((chunk) => chunk.toLowerCase()),
    delay(1000)
  )

  .subscribe({
    next: (chunk) => console.log(chunk),
    complete: () => {
      console.log("complete");
    },
  });
