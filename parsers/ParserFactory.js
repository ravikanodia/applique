const fs = require('fs');
const File = require('../lib/File');
const IpsParser = require('./ipsParser');
const UpsParser = require('./upsParser');

var ParserFactory = function(inputSource, patchSource, outputBuffer, parsedArgs) {
    this.inputSource = inputSource;
    this.patchSource = patchSource;
    this.outputBuffer = outputBuffer;
    this.parsedArgs = parsedArgs;

    this.getParser = function() {
	var parserType;
	if (parsedArgs.type == 'ips') {
	    parserType = IpsParser;
	} else if (parsedArgs.type == 'ups') {
	    parserType = UpsParser;
	} else {
	    throw new Error("automatic patch type detection does not work yet!");
	}

	return parserType(this.inputSource, this.patchSource, this.outputBuffer, this.parsedArgs);
    };
	
    return this;	
}

module.exports = ParserFactory;
