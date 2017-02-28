const fs = require('fs');

var File = function(filename) {

    var filename = filename;
    var fd = fs.openSync(filename, 'r');
    var position = 0;

    return {
	// Returns a new buffer of size length, filled with data from the file.
	// If not enough data was read, throws an error.
	readBytesAsBuffer: function(length, name, readPosition=null, failOnUnderrun=true) {
	    var buf = Buffer.alloc(length);
	    buf.fill(0x00);
	    var bytesRead;
	    if (readPosition == null) {
		bytesRead = fs.readSync(fd, buf, 0, length, position);
		position += bytesRead;
	    } else {
		bytesRead = fs.readSync(fd, buf, 0, length, readPosition);
	    }
	    if (bytesRead != length && failOnUnderrun) {
		throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + bytesRead + " bytes.");
	    }
//	    console.dir("Got " + length + " bytes of " + name);

	    return buf;
	},

	readBytesAsUIntBE: function(length, name="UIntBE", readPosition=null) {
	    var buf = this.readBytesAsBuffer(length, name, readPosition);
	    return buf.readUIntBE(0, length);
	},

	getFileLength: function() {
	    var stats = fs.statSync(filename);
	    return stats.size;
	},

	getFilename: function() {
	    return filename;
	},

	getPosition: function() {
	    return position;
	},

	seekRelativeToCurrent: function(offset) {
	    position += offset;
	},

	close: function () {
	    fs.closeSync(fd);
	}
    }
};

module.exports = File;
