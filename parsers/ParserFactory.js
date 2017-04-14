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
var ParserFactory = function(inputSource, patchSource, outputBuffer, parsedArgs) {
    this.inputSource = inputSource;
    this.patchSource = patchSource;
    this.outputBuffer = outputBuffer;
    this.parsedArgs = parsedArgs;

    this.getParser = function() {
	var parserType;

	if (parsedArgs.mode === 'apply') {
	    if (parsedArgs.type == 'ips') {
		parserType = IpsParser;
	    } else if (parsedArgs.type == 'ups') {
		parserType = UpsParser;
	    } else if (parsedArgs.patch.toLowerCase().endsWith('ips')) {
		parserType = IpsParser;
	    } else if (parsedArgs.patch.toLowerCase().endsWith('ups')) {
		parserType = UpsParser;
	    } else {
		throw new Error("automatic patch type detection failed!");
	    }
	} else if (parsedArgs.mode === 'create') {
	    if (parsedArgs.type == 'ips') {
		parserType = IpsCreator;
	    } else if (parsedArgs.type == 'ups') {
		throw new Error("UPS patch creation not implemented yet");
	    } else if (parsedArgs.patch.toLowerCase().endsWith('ips')) {
		parserType = IpsCreator;
	    } else if (parsedArgs.patch.toLowerCase().endsWith('ups')) {
		throw new Error("UPS patch creation not implemented yet");
	    } else {
		throw new Error("automatic patch type detection failed!");
	    }
	}
	return parserType(this.inputSource, this.patchSource, this.outputBuffer, this.parsedArgs);
    };
	
    return this;	
}

module.exports = ParserFactory;
