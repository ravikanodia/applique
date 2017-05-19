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


  // Returns the patch type based on the type parameter, or the filename if the
  // type is auto. Does not examine patch contents.
  that.getPatchType = function() {
    if (that.type == 'auto') {
      // extname() includes the leading period.
      var suffix =
        path.extname(that.patchFilename).toLowerCase().replace(/^\./, "");
      if (_.contains(['ips', 'ups'], suffix)) {
        return suffix;
      } else {
        throw new Error("automatic patch type detection failed!");
      }
    } else {
      console.log("non-auto type: " + that.type);
      return that.type;
    }
  };

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
