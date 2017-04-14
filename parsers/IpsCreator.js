const fs = require('fs');
const File = require('../lib/File');

// TODO: move shared constants into their own file

const IPS_HEADER = "PATCH";

const IPS_OFFSET_SIZE = 3;
const IPS_SIZE_SIZE = 2;
const IPS_RLE_LENGTH_SIZE = 2;
const IPS_RLE_VALUE_SIZE = 1;

const IPS_FOOTER = "EOF";

var IpsCreator = function(originalFile,  deltaBuffer, targetFile) {
    this.originalFile = originalFile;
    this.targetFile = targetFile;
    this.deltaBuffer = deltaBuffer;


    this.writeIpsHeader = function() {
	this.deltaBuffer.write(IPS_HEADER);
    }

    this.writeIpsFooter = function() {
	this.deltaBuffer.write(IPS_FOOTER);
    }

    this.getNextDiff = function() {
	while (true) {
	    if (targetFile.getPosition() >= targetFile.getLength()) {
		return null;
	    }

	    if (targetFile.getPosition() >= originalFile.getLength()) {
		break;
	    }
	   
	    if (originalFile.readBytesAsUIntBE(1, "data") !=
		targetFile.readBytesAsUIntBE(1, "data")) {
		break;
	    }
	}

	var offset = targetFile.getPosition() - 1;
	while (true) {
	    if (targetFile.getPosition() >= targetFile.getLength()) {
		break;
	    }
	    var targetByte = targetFile.readBytesAsUIntBE(1, "data");
	    var originalByte = targetFile.getPosition() <= originalFile.getLength() ?
		originalFile.readBytesAsUIntBE(1, "data") : 0;
	    console.log(`left byte is ${targetByte}, right byte is ${originalByte}`); 
	    if (targetByte === originalByte) {
		break;
	    }
	}
	var end = targetFile.getPosition() - 1;

	console.log(`creating data patch from ${offset} to ${end}`);
	return this.createDataPatch(offset, end);
    }

    this.createDataPatch = function(offset, end) {
	var patchBuf = this.deltaBuffer;
	return function() {
	    // Write offset as a 3-byte integer
	    patchBuf.writeUIntBE(offset, IPS_OFFSET_SIZE);

	    // Write length as a 2-byte integer
	    patchBuf.writeUIntBE(end - offset, IPS_SIZE_SIZE);

	    // Copy bytes from targetFile into deltaBuffer
	    patchBuf.write(targetFile, null, offset, end);
	}
    }

    this.applyAllPatches = function() {
	if (targetFile.getLength() < originalFile.getLength()) {
	    throw new Error(`IPS patches cannot reduce the length of a file (original is ${originalFile.getLength()}, target is ${targetFile.getLength()}`);
	}

	this.writeIpsHeader();

	while (true) {
	    var diff = this.getNextDiff();
	    if (diff === null) {
		break;
	    }
	    diff();
	}

	this.writeIpsFooter();
	
    }
    return this;	
}

module.exports = IpsCreator;
