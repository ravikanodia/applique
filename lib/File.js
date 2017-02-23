const fs = require('fs');

var File = function() {

    // Returns a new buffer of size length, filled with data from the file.
    // If not enough data was read, throws an error.
    this.readBytesAsBuffer = function(fd, length, name, position=null) {
	var buf = Buffer.alloc(length);
	var bytesRead = fs.readSync(fd, buf, 0, length, position);
	if (bytesRead != length) {
	    throw new Error("Expected " + length + " bytes of " + name + " but hit end of file after " + bytesRead + " bytes.");
	}
        console.dir("Got " + length + " bytes of " + name);
	return buf;
    };

    return this;
}();

module.exports = File;
