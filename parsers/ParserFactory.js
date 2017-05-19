const fs = require('fs');
const File = require('../lib/File');
const IpsCreator = require('./IpsCreator');
const IpsParser = require('./IpsParser');
const UpsParser = require('./UpsParser');

/**
 * ParserFactory abstracts out the process of choosing a
 * parser type and instantiating it. Logic related to automatic
 * patch type detection should probably go here.
 */
var ParserFactory = function(inputSource, patchSource, outputBuffer, configuration) {
  this.inputSource = inputSource;
  this.patchSource = patchSource;
  this.outputBuffer = outputBuffer;
  this.configuration = configuration;

  this.getParser = function() {
    var parserType;

    var modePatchTypeParser = {
      apply: {
        ips: IpsParser,
        ups: UpsParser
      },
      create: {
        ips: IpsCreator
      }
    };

    var patchTypeParser = modePatchTypeParser[configuration.mode];
    if (!patchTypeParser) {
      throw new Error("Can't find parsers for mode: " + configuration.mode);
    }

    var parserType = patchTypeParser[configuration.getPatchType()];
    if (!parserType) {
      throw new Error("Can't find parser for type: " + configuration.getPatchType());
    }

    return parserType(this.inputSource, this.patchSource, this.outputBuffer, this.configuration);
  };

  return this;
}

module.exports = ParserFactory;
