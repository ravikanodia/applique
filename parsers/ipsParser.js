const fs = require('fs');
const File = require('../lib/File');

// Based on http://zerosoft.zophar.net/ips.php

// An IPS file always starts with the ASCII text "PATCH" (not null-terminated).
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

// An IPS file always ends with "EOF" (not null-terminated)).
const IPS_FOOTER = "EOF";

// A couple of observations:
// * Because the offset size is fixed at 3 bytes (24 bits), IPS patches cannot
//   specify an offset higher than 2^24 - 1. That is to say, they cannot
//   operate on files larger than 2GB.
// * IPS patches can potentially write past the end of the file. This behavior
//   is not explicitly documented as far as I'm aware, but it's definitely used
//   'in the wild' by real patch authors. The spec does not say what to do if
//   there is a gap between the end of the original file and an offset specified
//   by an IPS file. Based on observation of other IPS tools, I believe the
//   correct behavior is to pad the original file with as many zeroes as is
//   necessary to fill the gap. (And luckily it appears that is the default
//   behavior of node's fs module.)
// * The IPS format does not lend itself to streaming the input file off of
//   disk and patching as you parse the IPS file, because there is no
//   requirement for a patch's offset to be greater than the previous one.
// * IPS patches don't have any type of file integrity checks, for either the
//   input or output files. Thus there is no way to know if the file you are
//   patching is the "right" file, and no way to be sure that you've applied
//   the patch correctly except to compare it against a trusted reference.


var IpsParser = function(filename) {
    this.filename = filename;
    this.file = null;

    // Doing this in the filesystem avoids having to fit a potentially
    // large Buffer in memory all at once. Also, node Buffers can't be resized
    // after they are created, and IPS patches can write past the end of the
    // file.
    this.makeRlePatch = function(offset, length, valueBuf) {
	return function(fd) {
	    var patchBuf = Buffer.alloc(length, valueBuf[0]);
	    fs.writeSync(fd, patchBuf, 0, length, offset);
	};
    }

    this.makeDataPatch = function(offset, data) {
	return function(fd) {
	    fs.writeSync(fd, data, 0, data.length, offset);
	}
    }

    this.validateIpsHeader = function() {
	var headerBuffer = this.file.readBytesAsBuffer(IPS_HEADER.length, "header");
	if (headerBuffer != IPS_HEADER) {
	    throw new Error("Invalid IPS patch header");
	}
        console.dir("IPS file header validated.");
    }

    this.getNextPatch = function() {
	// "EOF" is technically a valid offset. For the sake of correctness,
	// don't just stop when you see "EOF" in the offset field - make sure
	// this is the end of the file. If not, the IPS patch is malformed.
	if (this.file.position == this.file.getFileLength() - 3) {
	    var eofBuffer = this.file.readBytesAsBuffer(
		IPS_FOOTER.length, "EOF", this.file.position);
	    if (eofBuffer == IPS_FOOTER) {
		console.dir("Reached IPS footer.");
		return null;
	    } else {
		throw new Error("Invalid IPS footer.");
	    }
	}

/*	var offsetBuf = this.file.readBytesAsBuffer(IPS_OFFSET_SIZE, "offset");
	var sizeBuf = this.file.readBytesAsBuffer(IPS_SIZE_SIZE, "size");

     	var offset = offsetBuf.readUIntBE(0, IPS_OFFSET_SIZE);
	var size = sizeBuf.readUIntBE(0, IPS_SIZE_SIZE);*/
	var offset = this.file.readBytesAsUIntBE(IPS_OFFSET_SIZE);
	var size = this.file.readBytesAsUIntBE(IPS_SIZE_SIZE);
	if (size == 0) {
	    console.dir("size field is 0 (record is run-length encoding)");
//	    var runLengthBuffer = this.file.readBytesAsBuffer(IPS_RLE_LENGTH_SIZE, "run length");
	    //	    var runLength = runLengthBuffer.readUIntBE(0, 2);
	    var runLengthBuffer = this.file.readBytesAsUIntBE(2)
	    if (runLength === 0) {
		throw new Error("Can't have a run of zero length.");
	    }

	    var valueBuffer = this.file.readBytesAsBuffer(IPS_RLE_VALUE_SIZE, "run value");

	    console.dir("RLE length: " + runLength + "; data: " + valueBuffer)
	    return this.makeRlePatch(offset, runLength, valueBuffer);
	} else {
	    console.dir("size is " + size + " (plain data)");
	    var dataBuffer = this.file.readBytesAsBuffer(size, "data");
	    return this.makeDataPatch(offset, dataBuffer);
	}	
    }

    this.getAllPatches = function() {
	this.file = File(filename);

        console.dir("Parsing IPS file: " + this.filename);

	this.validateIpsHeader();

	var patches = [];
	while (true) {
	    var patch = this.getNextPatch();
	    if (patch === null) {
		break;
	    }
	    patches.push(patch);
	}

	this.file.close();

	return patches;
    }
	
    return this;	
}

module.exports = IpsParser;
