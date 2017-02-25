const fs = require('fs');

var File = function(filename) {
    this.filename = filename;
    this.fd = fs.openSync(filename, 'r');
    this.position = 0;

    // Returns a new buffer of size length, filled with data from the file.
    // If not enough data was read, throws an error.
    this.readBytesAsBuffer = function(length, name, readPosition=null) {
	var buf = Buffer.alloc(length);
	var bytesRead;
	if (readPosition == null) {
	    bytesRead = fs.readSync(this.fd, buf, 0, length, this.position);
	    this.position += bytesRead;
	} else {
	    bytesRead = fs.readSync(this.fd, buf, 0, length, readPosition);
	}
	if (bytesRead != length) {
	    throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + bytesRead + " bytes.");
	}
        console.dir("Got " + length + " bytes of " + name);

	return buf;
    };

    this.readBytesAsUIntBE = function(length, name="UIntBE", readPosition=null) {
	var buf = this.readBytesAsBuffer(length, name, readPosition);
	return buf.readUIntBE(0, length);
    }

    this.getFileLength = function() {
	var stats = fs.statSync(this.filename);
	return stats.size;
    }

    this.getFilename = function() {
	return this.filename;
    }

    this.getPosition = function() {
	return this.position;
    }

    this.close = function() {
	fs.closeSync(this.fd);
    }

    return this;
};

module.exports = File;
