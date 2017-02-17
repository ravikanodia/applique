const fs = require('fs');

// Based on http://zerosoft.zophar.net/ips.php

// An IPS file always starts with "PATCH".
const IPS_HEADER = "PATCH";

// After the header, an IPS file can have any number of patch records.
// There are two types of specifications. Both start with a 3-byte offset into
// the target file. Then comes a 2-byte size indicator. If the size indicator
// is not zero, then that many bytes of data (starting immediately after the
// size indiactor) should be copied into the target file at the given offset.
// If the size indicator is zero, that signals run-length encoding. The next
// two bytes indicate the length of the run, and the byte after that is the
// data to repeat for the length of the run.
//
// Records do not have a terminator.
// Data Record                |  RLE Record
// offset: 3 bytes            |  offset: 3 bytes
// size: 2 bytes (nonzero)    |  size: 2 bytes (zero)
// data: {size} bytes         |  run:  2 bytes
//                            |  value: 1 byte
const IPS_OFFSET_SIZE = 3;
const IPS_SIZE_SIZE = 2;
const IPS_RLE_LENGTH_SIZE = 2;
const IPS_RLE_VALUE_SIZE = 1;

// An IPS file always ends with "EOF".
const IPS_END_MARKER = "EOF";


var IpsParser = function(filename) {
    this.filename = filename;
    this.file = null;

    console.dir("ips parser got filename: " + this.filename);

    this.validateIpsFileHeader = function() {
	if (!this.file) {
	    this.file = fs.openSync(filename, 'r');
	}
	console.dir("validating ips file header");
	var headerBuffer = Buffer.alloc(IPS_HEADER.length);
	var bytesRead = fs.readSync(
	    this.file,
	    headerBuffer,
	    0,
	    IPS_HEADER.length,
	    null);
	console.dir("got " + bytesRead + " bytes: " + headerBuffer);
	if (headerBuffer == IPS_HEADER) {
	    console.dir("It's an IPS patch");
	} else {
	    throw new Error("Not an IPS patch");
	}
    }

    this.getNextPatch = function() {
	var offsetBuffer = Buffer.alloc(IPS_OFFSET_SIZE);
	var bytesRead = fs.readSync(
	    this.file,
	    offsetBuffer,
	    0,
	    IPS_OFFSET_SIZE,
	    null);
	if (bytesRead < IPS_OFFSET_SIZE) {
	    throw new Error("Malformed IPS patch. Expected a 3-byte offset indicator, or an EOF marker, but got end-of-file instead.");
	}
	if (offsetBuffer == IPS_END_MARKER) {
	    // TODO: If there's anything in the file past the EOF marker,
	    // throw an Error.
	    console.dir("found end marker");
	    return null;
	}
      	var offset = offsetBuffer.readUIntBE(0, IPS_OFFSET_SIZE);

	var sizeBuffer = Buffer.alloc(IPS_SIZE_SIZE);
	bytesRead = fs.readSync(
	    this.file,
	    sizeBuffer,
	    0,
	    IPS_SIZE_SIZE,
	    null);
	if (bytesRead < IPS_SIZE_SIZE) {
	    throw new Error("Malformed IPS patch. Expected a 2-byte size indicator, but got end-of-file instead.");
	}
	var size = sizeBuffer.readUIntBE(0, 2);
	if (size == 0) {
	    console.dir("size is 0. run-length encoding.");
	    var runLengthBuffer = Buffer.alloc(IPS_RLE_LENGTH_SIZE);
	    bytesRead = fs.readSync(
		this.file,
		runLengthBuffer,
		0,
		IPS_RLE_LENGTH_SIZE,
		null);
	    if (bytesRead < IPS_RLE_LENGTH_SIZE) {
		throw new Error("Malformed IPS patch. Expected a 2-byte run length indicator, but got end-of-file instead.");
	    }
	    var runLength = runLengthBuffer.readUIntBE(0, 2);
	    
	    var valueBuffer = Buffer.alloc(IPS_RLE_VALUE_SIZE);
	    bytesRead = fs.readSync(
		this.file,
		valueBuffer,
		0,
		IPS_RLE_VALUE_SIZE,
		null);
	    if (bytesRead < IPS_RLE_VALUE_SIZE) {
		throw new Error("Malformed IPS patch. Expected 1-byte run value, but got end-of-file instead.");
	    }

	    var patch =  {
		type: "ips_rle",
		offset: offset,
		runLength: runLength,
		value: valueBuffer
	    };
	    console.dir("patch: " + patch);
	    return patch;
	} else {
	    console.dir("size is: " + size);

	    var dataBuffer = Buffer.alloc(size);
	    bytesRead = fs.readSync(
		this.file,
		dataBuffer,
		0,
		size,
		null);
	    if (bytesRead < size) {
		throw new Error("Malformed IPS patch. Expected " + size + " bytes of data, but hit end of file after only " + bytesRead + " bytes.");
	    }
	    var patch = {
		type: "ips_data",
		offset: offset,
		size: size,
		data: dataBuffer
	    };
	    console.dir("patch type: " + patch.type + "; offset: " + patch.offset + "; size: " + size + "; data: " + dataBuffer);
	    return patch;
	}	
    }

    this.getAllPatches = function() {
	this.validateIpsFileHeader();

	var patch;
	var patches = [];

	while (true) {
	    patch = this.getNextPatch();
	    if (patch === null) {
		break;
	    }
	    patches.push(patch);
	}

	return patches;
    }
	
    return this;	
}

module.exports = IpsParser;
