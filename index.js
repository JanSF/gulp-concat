var through2 = require('through2');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var Buffer = require('buffer').Buffer;

//module.exports = function(filename, opt){
//
//
//  return through2({objectMode: true}, function(chunk, enc, callback){
//    console.log(chunk);
//    //if (data.isString()) this.push(chunk);
//    //callback();
//  });
//}

module.exports = function(fileName, opt){
  if (!fileName) throw new PluginError('gulp-concat', 'Missing fileName option for gulp-concat');
  if (!opt) opt = {};
  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof opt.newLine !== 'string') opt.newLine = gutil.linefeed;

  var buffer = [];
  var firstFile = null;
  var newLineBuffer = opt.newLine ? new Buffer(opt.newLine) : null;

  function bufferContents(data, encoding, callback){
    if (data == null) return; // ignore
    //if (data.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

    if (firstFile && newLineBuffer) buffer.push(newLineBuffer);
    if (!firstFile) firstFile = data;

    this.push(data.contents);
    callback();
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var joinedContents = Buffer.concat(buffer);

    var joinedPath = path.join(firstFile.base, fileName);

    var joinedFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: joinedContents
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return through2({objectMode: true}, bufferContents, endStream);
};
