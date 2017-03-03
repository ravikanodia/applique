
var SourceBuffer = function(buf) {
    var sourceBuf = buf;

    var position = 0;

    return {
	// Returns a new buffer of size length, filled with data from the buffer.
	// If not enough data was read, throws an error.
	readBytesAsBuffer: function(length, name, readPosition=null, failOnUnderrun=true) {
	    var buf = Buffer.alloc(length);
	    buf.fill(0x00);
	    var readLength = length;
	    
	    if (readPosition == null) {
		if (position + length > sourceBuf.length) {
		    readLength = sourceBuf.length - position;
		    if (failOnUnderrun) {
			throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + readLength + " bytes.");
		    }
		} 

		sourceBuf.copy(buf, 0, position, position + readLength);
		position += length;
	    } else {
		if (readPosition + length > sourceBuf.length) {
		    readLength = sourceBuf.length - readPosition;
		    if (failOnUnderrun) {
			throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + readLength + " bytes.");
		    }
		}
		sourceBuf.copy(buf, 0, readPosition, readPosition + readLength);
	    }

	    return buf;
	},

	readBytesAsUIntBE: function(length, name="UIntBE", readPosition=null) {
	    var buf = this.readBytesAsBuffer(length, name, readPosition);
	    return buf.readUIntBE(0, length);
	},

	getLength: function() {
	    return sourceBuf.length;
	},

	getPosition: function() {
	    return position;
	},

	seekRelativeToCurrent: function(offset) {
	    position += offset;
	}
    }
};

module.exports = SourceBuffer;
