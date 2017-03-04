const fs = require('fs');

/**
 * The idea behind this class is to function as an interface which could represent a
 * variety of ways to manipulate and edit a file.
 */
var OutputBuffer = function() {
    var internalBuf = Buffer.alloc(0);
    var outputLength = 0;  // We over-allocate internalBuf; keep track of the "real" output here.
    var position = 0;

    return {
	write: function(buf, writePosition=null) {
	    var writeIndex = (writePosition === null ? position : writePosition);
	    position += (writePosition === null ? buf.length : 0);
	    if (writeIndex + buf.length > internalBuf.length) {
		this.extend(writeIndex + buf.length);
	    }
	    buf.copy(internalBuf, writeIndex);
	    outputLength = Math.max(outputLength, writeIndex + buf.length);
	},

	extend: function(length) {
	    var extendLength = Math.max(length, internalBuf.length * 2);
	    var extendedBuf = Buffer.alloc(extendLength);
	    internalBuf.copy(extendedBuf);
	    internalBuf = extendedBuf;
	},

	getLength: function() {
	    return internalBuf.length;
	},

	getPosition: function() {
	    return position;
	},

	seekRelativeToCurrent: function(offset) {
	    position += offset;
	},

	truncate: function() {
	    var truncatedBuf = Buffer.alloc(outputLength);
	    internalBuf.copy(truncatedBuf, 0, 0, outputLength);
	    internalBuf = truncatedBuf;
	},

	saveToFile: function(filename) {
	    this.truncate();
	    fs.writeFileSync(filename, internalBuf);
	}
    }
};

module.exports = OutputBuffer;
