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

    if (configuration.mode === 'apply') {
      if (configuration.type == 'ips') {
        parserType = IpsParser;
      } else if (configuration.type == 'ups') {
        parserType = UpsParser;
      } else if (configuration.patchFilename.toLowerCase().endsWith('ips')) {
        parserType = IpsParser;
      } else if (configuration.patchFilename.toLowerCase().endsWith('ups')) {
        parserType = UpsParser;
      } else {
        throw new Error("automatic patch type detection failed!");
      }
    } else if (configuration.mode === 'create') {
      if (configuration.type == 'ips') {
        parserType = IpsCreator;
      } else if (configuration.type == 'ups') {
        throw new Error("UPS patch creation not implemented yet");
      } else if (configuration.patchFilename.toLowerCase().endsWith('ips')) {
        parserType = IpsCreator;
      } else if (configuration.patchFilename.toLowerCase().endsWith('ups')) {
        throw new Error("UPS patch creation not implemented yet");
      } else {
        throw new Error("automatic patch type detection failed!");
      }
    }
    return parserType(this.inputSource, this.patchSource, this.outputBuffer, this.configuration);
  };

  return this;
}

module.exports = ParserFactory;
