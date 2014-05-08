var stream = require('readable-stream');
var util = require('util');

var ParallelTransformStream = function(options, userTransform, userFlush) {
  if({}.toString.call(options) === '[object Function]') {
    userFlush = userTransform;
    userTransform = options;
  }
  
  stream.Transform.call(this, {objectMode: true});
  this.savedCallback = null;
  this.savedEndCallback = null;
  this.buffer = [];
  this.concurrency = options.concurrency || 2;
  this.userTransform = userTransform;
};
util.inherits(ParallelTransformStream, stream.Transform);


ParallelTransformStream.prototype._drainBuffer = 
  function _drainBuffer() {
    while(this.buffer.length) {
      var item = this.buffer[0];
      if(!item.completed) {
        break;
      }
      item.chunks.forEach(function(chunk) {
        this.push(chunk);
      }, this);
      this.buffer.shift();
    }
    if(this.buffer.length < this.concurrency) {
      var tmpCallback = this.savedCallback;
      this.savedCallback = null;
      tmpCallback && tmpCallback();
    }
    
    if(!this.buffer.length && this.savedEndCallback) {
      this.savedEndCallback();
    }
  };
  
ParallelTransformStream.prototype._createCallback = 
  function _createCallback(item) {
    var self = this;
    return function(err, chunk) {
      if(err) {
        self.emit('error', err);
        item.chunks = [];
      } else {
        if (chunk) {
          item.chunks.push(chunk);
        }
      }
      item.completed = true;
      self._drainBuffer();
    };
  };
  
ParallelTransformStream.prototype._createContext = 
  function _createContext(item) {
    var self = this;
    return {
      push: function(chunk) {
        item.chunks.push(chunk);
      },
      emit: function() {
        self.emit.apply(self, arguments);
      }
    }
  };
  
ParallelTransformStream.prototype._transform = 
  function(chunk, enc, done) {
    var item = {chunks: [], completed: false};
    this.buffer.push(item);
    this.userTransform.call(this._createContext(item), 
      chunk, enc, this._createCallback(item));
    if(this.buffer.length < this.concurrency) {
      done();
    } else {
      this.savedCallback = done;
    }
  };

ParallelTransformStream.prototype._flush =
  function _flush(done) {
    if(this.buffer.length === 0) {
      this.userFlush ? this.userFlush(done) : done();
    } else {
      this.savedEndCallback = this.userFlush ? this.userFlush.bind(this, done) : done;
    }
  };
  
module.exports = ParallelTransformStream;

