[![NPM version](https://badge.fury.io/js/through2-parallel.png)](http://badge.fury.io/js/through2-parallel)
[![Build Status](https://travis-ci.org/mariocasciaro/through2-parallel.png)](https://travis-ci.org/mariocasciaro/through2-parallel)
[![Coverage Status](https://coveralls.io/repos/mariocasciaro/through2-parallel/badge.png)](https://coveralls.io/r/mariocasciaro/through2-parallel)
[![Dependency Status](https://gemnasium.com/mariocasciaro/through2-parallel.png)](https://gemnasium.com/mariocasciaro/through2-parallel)
# through2-parallel

Creates a through stream (Transform stream) which executes in parallel while maintaining the order
of the emitted chunks.

Stability: **Experimental**

## Usage

```javascript
var throughParallel = require('through2-parallel');

var stream = throughParallel.obj(function(chunk, enc, cb) {
  var self = this;
  setTimeout(function() {
    console.log("Completed " + chunk.order);
    self.push(chunk.order);
    cb();
  }, chunk.time);
  console.log("Started " + chunk.order);
});

stream.on('data', function(chunk) {
  console.log("Emitted: " + chunk);
});

stream.write({time: 500, order: 1});
stream.write({time: 200, order: 2});
stream.write({time: 100, order: 3});
stream.end();
```

The code above will print (default concurrency is 2):
```
Started 1
Started 2
Completed 2
Completed 1
Emitted: 1
Emitted: 2
Started 3
Completed 3
Emitted: 3
```


## API


#### throughParallel([options], [transform], [flush])

* `options`: Options to pass to the [`Transform`](http://nodejs.org/api/stream.html#stream_new_stream_transform_options) stream plus one specific option:
  *  `concurrency`: defaults to `2` and specifies how many tasks can run in parallel
* `transform`: the [`_transform`](http://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback) function.
* `flush`: the [`_flush`](http://nodejs.org/api/stream.html#stream_transform_flush_callback) function.

#### throughParallel.obj([options], [transform], [flush])

A syntactic sugar for `throughParallel({objectMode: true}, ...)`.
