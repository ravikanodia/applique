const fs = require('fs');
const crc = require('crc');
/**
 * The idea behind this class is to function as an interface which could represent a
 * variety of inputs. For now it only works with a Buffer, which means that the whole
 * thing has to be loaded into memory. But it could also have an implementation backed
 * by a file descriptor.
 */
var SourceBuffer = function(buf) {
    var contentBuf = buf || Buffer.alloc(0);
    var position = 0;
    // For optimization purposes, the internal buffer can be over-allocated. Thus,
    // we keep track of the content's length separately.
    var contentLength = contentBuf.length;

    var that = {
	// Returns a new buffer of size length, filled with data from the buffer.
	// If not enough data was read, throws an error.
	readBytesAsBuffer: function(length, name='data', readPosition=null, failOnUnderrun=true) {
	    var buf = Buffer.alloc(length);
	    buf.fill(0x00);
	    var readLength = length;
	    
	    if (readPosition == null) {
		if (position + length > this.getLength()) {
		    readLength = this.getLength() - position;
		    if (failOnUnderrun) {
			throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + readLength + " bytes.");
		    }
		} 

		contentBuf.copy(buf, 0, position, position + readLength);
		position += length;
	    } else {
		if (readPosition + length > this.getLength()) {
		    readLength = this.getLength() - readPosition;
		    if (failOnUnderrun) {
			throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + readLength + " bytes.");
		    }
		}
		contentBuf.copy(buf, 0, readPosition, readPosition + readLength);
	    }

	    return buf;
	},

	readUInt8: function(readPosition) {
	    return this.readBytesAsUIntBE(1, "UInt8", readPosition);
	},

	readBytesAsUIntBE: function(length, name="UIntBE", readPosition=null) {
	    var buf = this.readBytesAsBuffer(length, name, readPosition);
	    return buf.readUIntBE(0, length);
	},

	readBytesAsUIntLE: function(length, name="UIntBE", readPosition=null) {
	    var buf = this.readBytesAsBuffer(length, name, readPosition);
	    return buf.readUIntLE(0, length);
	},

	getLength: function() {
	    return contentLength;
	},

	getPosition: function() {
	    return position;
	},

	seekAbsolute: function(offset) {
	    position = offset;
	},

	seekRelativeToCurrent: function(offset) {
	    position += offset;
	},

	equals: function(buf) {
	    var length = this.getLength();
	    if (length != buf.getLength()) {
		return false;
	    }
	    for (var i = 0; i < length; i++) {
		if (this.readBytesAsUIntBE(1, "comparison", i) !=
		    buf.readBytesAsUIntBE(1, "comparison", i)) {
		    return false;
		}
	    }
	    return true;
	},

	write: function(buf, writePosition=null, start=null, end=null) {
	    if (typeof buf === 'string') {
		buf = Buffer.from(buf);
	    }
	    var writeIndex = (writePosition === null ? position : writePosition);
	    var sourceStart = start === null ? 0 : start;
	    var sourceEnd = end === null ? buf.length : end;
	    var writeLength = sourceEnd - sourceStart;
	    position += (writePosition === null ? writeLength : 0);
	    if (writeIndex + writeLength > contentBuf.length) {
		this.extend(writeIndex + writeLength);
	    }

	    for (var x = 0; x < writeLength; x++) {
		contentBuf.writeUInt8(buf.readUInt8(sourceStart + x), writeIndex + x)
            }

	    contentLength = Math.max(contentLength, writeIndex + writeLength);
	},

	// Size is in bytes.
	writeUIntBE: function(value, size, writePosition=null) {
	    if (size < 1) {
		throw new Error(`Can't write an int with size less than 1 (got ${size})`);
	    }
	    if (size > 6) {
		throw new Error(`Can't write an int with size greater than 6 (got ${size})`);
	    }
	    if (value >= Math.pow(256, size)) {
		throw new Error(`Int ${value} is too big to fit in ${size} bytes`);
	    }
	    var writeIndex = writePosition === null ? position: writePosition;
	    position += writePosition === null ? size : 0;
	    if (writeIndex + size > contentBuf.length) {
		this.extend(writeIndex + size);
	    }
	    contentBuf.writeIntBE(value, writeIndex, size);
	},

	// Extends the internal buffer to at least the value of length.
	// Does not change the contentLength.
	extend: function(length) {
	    var extendLength = Math.max(length, contentBuf.length * 2);
	    var extendedBuf = Buffer.alloc(extendLength);
	    contentBuf.copy(extendedBuf);
	    contentBuf = extendedBuf;
	},

	slice: function(start, end) {
	    this.truncate();
	    return SourceBuffer(contentBuf.slice(start, end));
	},

	toArrayBuffer: function() {
	    this.truncate();
	    return Uint8Array.from(contentBuf).buffer;
	},

	toString: function() {
	    this.truncate();
	    return contentBuf.toString();
	},

	// Reduces the internal buffer's size to the size of the content.
	truncate: function() {
	    if (contentBuf.length == contentLength) {
		return;
	    }
	    var truncatedBuf = Buffer.alloc(contentLength);
	    contentBuf.copy(truncatedBuf, 0, 0, contentLength);
	    contentBuf = truncatedBuf;
	},

	saveToFile: function(filename) {
	    this.truncate();
	    fs.writeFileSync(filename, contentBuf);
	},

	crc: function(trailingBytesToIgnore) {
	    this.truncate();
	    var crcBuf;
	    if (typeof trailingBytesToIgnore === 'undefined') {
		crcBuf = contentBuf;
	    } else {
		crcBuf = Buffer.alloc(contentLength - trailingBytesToIgnore);
		contentBuf.copy(crcBuf, 0, 0, crcBuf.length);
	    }
	    return crc.crc32(crcBuf);
	}

    };

    Object.defineProperty(that, 'length', {
	get: function() {
	    return this.getLength();
	}
    });

    return that;
};

module.exports = SourceBuffer;
