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

    return {
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

	readBytesAsUIntBE: function(length, name="UIntBE", readPosition=null) {
	    var buf = this.readBytesAsBuffer(length, name, readPosition);
	    return buf.readUIntBE(0, length);
	},

	getLength: function() {
	    return contentLength;
	},

	getPosition: function() {
	    return position;
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

	write: function(buf, writePosition=null) {
	    var writeIndex = (writePosition === null ? position : writePosition);
	    position += (writePosition === null ? buf.length : 0);
	    if (writeIndex + buf.length > contentBuf.length) {
		this.extend(writeIndex + buf.length);
	    }
	    buf.copy(contentBuf, writeIndex);
	    contentLength = Math.max(contentLength, writeIndex + buf.length);
	},

	// Extends the internal buffer to at least the value of length.
	// Does not change the contentLength.
	extend: function(length) {
	    var extendLength = Math.max(length, contentBuf.length * 2);
	    var extendedBuf = Buffer.alloc(extendLength);
	    contentBuf.copy(extendedBuf);
	    contentBuf = extendedBuf;
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

	crc: function() {
	    this.truncate();
	    return crc.crc32(contentBuf);

	}

    }
};

module.exports = SourceBuffer;
