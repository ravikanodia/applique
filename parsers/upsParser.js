const fs = require('fs');
const File = require('../lib/File');

// Based on http://fileformats.archiveteam.org/wiki/UPS_(binary_patch_format)

// A UPS file starts with a "header".
// Then, the size of the source file as a "UPS variable-width integer"
// Then, the size of the destination file as a variable-width integer
//   (Note: these can be different, because the patch can continue writing past
//    the end of the original file.)
// Then, any number of "hunks", consisting of:
// -- A variable-width integer, for the number of bytes to skip in the source file
// -- A block of data to XOR with the source file
//  +++ The block ends with a zero byte (which is included in the block)
//   --- ... except for the last block, if it is past the end of the original file(?)
// Lastly, three CRC32 checksums:
// -- One for the source file
// -- One for the destination file
// -- One for the patch itself (the contents of the patch, except for this checksum)
//
// About "variable-width integers":
// There are many different encoding/schemes for variable-width integers. To decode
// UPS variable-width integers:
// Your result starts at 0.
// Your offset starts at 0.
// For each byte you read:
// --- If the byte does NOT have its top bit set:
//  |    Set the top bit.
//  |    Shift it left, by the offset amount.
//  |    Add it to the result.
//  |    Add 7 to the offset.
//  |    Keep going.
//  +- If the byte DOES have its top bit set:
//       Unset the top bit.
//       Shift it left, by the offset amount.
//       Add it to the result.
//       Stop. Return the result.
//
// byuu's whitepaper on the ups spec includes this psuedocode for encoding a
// number into a UPS variable-width integer:
// def encode(uint64_t offset) {
//   loop {
//     uint64_t x = offset bit-wise and 0x7f
//     offset = offset right bit shift 7
//     if(offset == 0) {
//       zwrite(0x80 bit-wise or x);
//       break;
//     }
//     zwrite(x);
//     offset = offset - 1;
//   }
// }

// The header is "UPS1"
const UPS_HEADER = "UPS1";

const CRC32_SIZE = 4;

var UpsParser = function(inputSource, patchSource, outputBuffer) {
    this.inputSource = inputSource;
    this.patchSource = patchSource;
    this.outputBuffer = outputBuffer;

    this.inputFilesize = null;
    this.outputFilesize = null;

    this.inputCRC = null;
    this.outputCRC = null;
    this.patchCRC = null;

    this.makeXorPatch = function(skipLength, dataBuf) {
	var inputSource = this.inputSource;
	return function(outBuffer) {
	    var skipBuf = inputSource.readBytesAsBuffer(skipLength, "skipped bytes", null, false);
	    outBuffer.write(skipBuf);

	    var buf = inputSource.readBytesAsBuffer(dataBuf.length, "source input", null, false);
	    for (var i = 0; i < dataBuf.length; i++) {
		buf[i] ^= dataBuf[i];
	    }
	    outBuffer.write(buf);
	};
    };

    this.makeCopyRemainingPatch = function() {
	var inputSource = this.inputSource;
	return function(outBuffer) {
	    var remainingBytes = inputSource.getLength() - inputSource.getPosition();
	    if (remainingBytes > 0) {
		var remainingBuf = inputSource.readBytesAsBuffer(remainingBytes, "trailing data");
		outBuffer.write(remainingBuf);
	    }
	}
    };

//    console.dir("Parsing UPS file: " + this.filename);

    this.validateUpsFileHeader = function() {
	var headerBuffer = this.patchSource.readBytesAsBuffer(UPS_HEADER.length, "header");
	if (headerBuffer != UPS_HEADER) {
	    throw new Error("Invalid UPS patch header");
	}
        console.dir("UPS file header validated.");
    }

    this.getCRCs = function() {
	this.inputCRC = this.patchSource.readBytesAsBuffer(
	    CRC32_SIZE,
	    "CRC32",
	    this.patchSource.getLength() - (CRC32_SIZE * 3));
	this.outputCRC = this.patchSource.readBytesAsBuffer(
	    CRC32_SIZE,
	    "CRC32",
	    this.patchSource.getLength() - (CRC32_SIZE * 2));
	this.patchCRC = this.patchSource.readBytesAsBuffer(
	    CRC32_SIZE,
	    "CRC32",
	    this.patchSource.getLength() - CRC32_SIZE);
    }

    this.validateInputFile = function() {
	var inputFilesize = this.inputSource.getLength();
	if (inputFilesize != this.inputFilesize) {
	    throw new Error("UPS patch specifies input file size of " + this.inputFilesize + ", but the specified file is of size " + inputFilesize);
	} else {
	    console.log("Input file has correct size of " + this.inputFilesize);
	}

	console.log("CRC32 checksum validation not supported; assuming input is valid!");
    }

    this.validatePatchFile = function() {
	var patchBuf = this.patchSource.readBytesAsBuffer(
	    this.patchSource.getLength() - CRC32_SIZE,
	    "patch",
	    0);
	console.log("CRC32 checksum validation not supported; assuming patch is valid!");
    }

    this.readUpsVariableLengthInteger = function() {
	var result = 0;
	var shiftOffset = 0;

	while (true) {
	    var buf = this.patchSource.readBytesAsBuffer(1, "variable-length integer");
	    var nextByte = buf[0];
	    if (nextByte & 0x80) {
		nextByte = nextByte & 0x7f;  // Unset top bit.
		result += nextByte << shiftOffset;
		return result;
	    } else {
		nextByte = nextByte | 0x80;  // Set top bit.
		result += nextByte << shiftOffset;
		shiftOffset += 7;
	    }
	}
    };

    this.isAtFooter = function() {
	if (this.patchSource.getPosition() == this.patchSource.getLength() - (3 * CRC32_SIZE)) {
	    return true;
	}
	return false
    };

    this.getNextPatch = function() {
	console.log("getting next UPS patch");
	var skipLength = this.readUpsVariableLengthInteger();
	console.log("skip length: " + skipLength);
	var patchStartPosition = this.patchSource.getPosition();
	do {
	    var buf = this.patchSource.readBytesAsBuffer(1, "xor");
	} while (buf[0] != 0x00)

	var patchLength = this.patchSource.getPosition() - patchStartPosition;
	// In the last patch, don't copy the 0 terminator. If we're past the end
	// of the input file, it will cause us to write an extra byte.
	if (this.isAtFooter()) {
	    patchLength -= 1;
	}
	console.log("patch length: " + patchLength);
	var patchBuf = this.patchSource.readBytesAsBuffer(patchLength, "xor", patchStartPosition);

	return this.makeXorPatch(skipLength, patchBuf);
    }

    this.applyAllPatches = function() {
	this.outputBuffer.extend(this.inputSource.getLength());

	this.validateUpsFileHeader();

	this.inputFilesize = this.readUpsVariableLengthInteger();
	console.log("Found input filesize of: " + this.inputFilesize);
	this.outputFilesize = this.readUpsVariableLengthInteger();
	this.getCRCs();
	console.log("Found output filesize of: " + this.outputFilesize);

	this.validateInputFile();
	this.validatePatchFile();

	var patches = [];
	while (!this.isAtFooter()) {
	    var patch = this.getNextPatch();
	    patches.push(patch);
	}
	patches.push(this.makeCopyRemainingPatch());

//	var tempFilename = "_" + this.outputFilename + ".temp";
//	console.dir("Creating temp output file: " + tempFilename);
//	var tempFile = fs.openSync(tempFilename, "w");

	for (var i = 0; i < patches.length; i++) {
	    console.dir("Applying patch " + (i+1) + " of " + patches.length);
	    var patch = patches[i];
	    patch(outputBuffer);
	}

//	fs.closeSync(tempFile);
//	console.dir("Saving output file: " + this.outputFilename);
//	fs.renameSync(tempFilename, this.outputFilename);

    }
	
    return this;	
}

module.exports = UpsParser;
