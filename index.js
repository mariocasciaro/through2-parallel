var ParallelStream = require('./parallelTransformStream');

module.exports = function throughParallel(options, transform, flush) {
  return new ParallelStream(options, transform, flush);
};


module.exports.obj = function throughParallelObj(options, transform, flush) {
  if({}.toString.call(options) === '[object Function]') {
    flush = transform;
    transform = options;
    options = {};
  }
  options.objectMode = true;
  return new ParallelStream(options, transform, flush);
};