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

    // Returns a new buffer of size length, filled with data from the file.
    // If not enough data was read, throws an error.
    this.readBytesAsBuffer = function(length, name) {
	var buf = Buffer.alloc(length);
	var bytesRead = fs.readSync(this.file, buf, 0, length, null);
	if (bytesRead != length) {
	    throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + bytesRead + " bytes.");
	}
        console.dir("Got " + length + " bytes of " + name);
	return buf;
    };

    // Because the patch functions take a Buffer as their argument,
    // the target file has to be able to fit in memory. It would be cool if
    // they could stream a file of arbitrary size from disk, and patch
    // as they go.
    this.makeRlePatch = function(offset, length, value) {
	return function(buf) {
	    for (var i = 0; i < length; i++) {
		buf[offset + i] = value;
	    }
	};
    }

    this.makeDataPatch = function(offset, data) {
	return function(buf) {
	    data.copy(buf, offset);
	}
    }

    console.dir("Parsing IPS file: " + this.filename);

    this.validateIpsFileHeader = function() {
	var headerBuffer = this.readBytesAsBuffer(IPS_HEADER.length, "header");
	if (headerBuffer != IPS_HEADER) {
	    throw new Error("Invalid IPS patch header");
	}
        console.dir("IPS file header validated.");
    }

    this.getNextPatch = function() {
	var offsetBuffer = this.readBytesAsBuffer(IPS_OFFSET_SIZE, "offset or EOF");
	// TODO: Technically, "EOF" is also a valid offset. Because fs lacks a peek()
	// function, it's kind of a pain to handle those cases correctly.
	if (offsetBuffer == IPS_END_MARKER) {
	    // TODO: If there's anything in the file past the EOF marker,
	    // throw an Error.
	    console.dir("Found end marker.");
	    return null;
	}
      	var offset = offsetBuffer.readUIntBE(0, IPS_OFFSET_SIZE);

	var sizeBuffer = this.readBytesAsBuffer(IPS_SIZE_SIZE, "size");
	var size = sizeBuffer.readUIntBE(0, IPS_SIZE_SIZE);
	if (size == 0) {
	    console.dir("size field is 0 (record is run-length encoding)");
	    var runLengthBuffer = this.readBytesAsBuffer(IPS_RLE_LENGTH_SIZE, "run length");
	    var runLength = runLengthBuffer.readUIntBE(0, 2);

	    var valueBuffer = this.readBytesAsBuffer(IPS_RLE_VALUE_SIZE, "run value");

	    return this.makeRlePatch(offset, runLength, valueBuffer);
	} else {
	    console.dir("size is " + size + " (plain data)");
	    var dataBuffer = this.readBytesAsBuffer(size, "data");
	    return this.makeDataPatch(offset, dataBuffer);
	}	
    }

    this.getAllPatches = function() {
	this.file = fs.openSync(filename, 'r');

	this.validateIpsFileHeader();

	var patches = [];
	while (true) {
	    var patch = this.getNextPatch();
	    if (patch === null) {
		break;
	    }
	    patches.push(patch);
	}

	fs.closeSync(this.file);

	return patches;
    }
	
    return this;	
}

module.exports = IpsParser;
