const fs = require('fs');

var Patcher = function(filename, patches, outputFilename) {
    this.filename = filename;
    this.patches = patches;
    this.outputFilename = outputFilename;

    this.applyPatches = function() {
	console.dir("Loading input file: " + this.filename);
	var fileBuf = fs.readFileSync(this.filename);

	for (var i = 0; i < this.patches.length; i++) {
	    console.dir("Applying patch " + i + " of " + this.patches.length);

	    var patch = this.patches[i];
	    patch(fileBuf);
	}

	console.dir("Saving output file: " + this.outputFilename);
	fs.writeFileSync(this.outputFilename, fileBuf);
    }
    return this;
}


module.exports = Patcher;
