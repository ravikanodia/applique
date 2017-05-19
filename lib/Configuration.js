const path = require('path');
const _ = require('underscore');

function makeConfiguration(config) {
  var that = {};
  var paramNames = [
    'inputFilename',
    'patchFilename',
    'outputFilename',
    'mode',
    'type'
  ];

  _.each(
    paramNames,
    function(paramName) {
      config.hasOwnProperty(paramName) && (that[paramName] = config[paramName]);
    });

  that.suggestFilename = function() {
    var inputExt = path.extname(that.inputFilename);
    var inputBase = path.basename(that.inputFilename, inputExt);

    var patchExt = path.extname(that.patchFilename);
    var patchBase = path.basename(that.patchFilename, patchExt);

    return patchBase + inputExt;
  }
      
  return that;
}

var Configuration = {
  fromObject: function(args) {
    return makeConfiguration({
      inputFilename: args.file,
      patchFilename: args.patch,
      outputFilename: args.output,
      mode: args.mode,
      type: args.type
    });
  },

  fromArguments: function(
    inputFilename, patchFilename, outputFilename, mode, type) {
    return makeConfiguration({
      inputFilename: inputFilename,
      patchFilename: patchFilename,
      outputFilename: outputFilename,
      mode: mode,
      type: type
    });
  }
}

module.exports = Configuration;
