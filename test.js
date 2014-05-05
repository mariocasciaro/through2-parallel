var expect = require('chai').expect;
var through = require('./');
  
describe('through2-parallel', function() {
  it('should execute tasks in parallel', function (done) {
    var steps = [];
    var stream = through.obj({concurrency: 2}, function(chunk, enc, cb) {
      setTimeout(function() {
        steps.push('completed ' + chunk);
        cb();
      }, 100);
      steps.push('started ' + chunk);
    });
    stream.on('end', function() {
      expect(steps).to.be.deep.equal([
        'started 1',
        'started 2',
        'completed 1',
        'started 3',
        'completed 2',
        'completed 3'
      ]);
      done();
    });
    
    stream.write(1);
    stream.write(2);
    stream.write(3);
    stream.end();
    
    stream.resume();
  });

  it('should preserve the order', function (done) {
    var out = [];
    var stream = through.obj(function(chunk, enc, cb) {
      var self = this;
      setTimeout(function() {
        self.push(chunk.order);
        cb();
      }, chunk.time);
    });
    stream.on('data', function(chunk) {
      out.push(chunk);
    });
    stream.on('end', function() {
      expect(out).to.be.deep.equal([
        1, 2, 3
      ]);
      done();
    });

    stream.write({time: 500, order: 1});
    stream.write({time: 200, order: 2});
    stream.write({time: 100, order: 3});
    stream.end();
  });

  it('context should allow event emission', function (done) {
    var stream = through.obj(function(chunk, enc, cb) {
      this.emit('error', new Error());
    });
    stream.on('error', function(error) {
      done();
    });

    stream.write("ignore");
    stream.end();
  });
});