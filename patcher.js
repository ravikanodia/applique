const fs = require('fs');

var Patcher = function(filename, patches, outputFilename, dryRun) {
    this.filename = filename;
    this.patches = patches;
    this.tempFilename = "_" + outputFilename + ".tmp";
    this.outputFilename = outputFilename;
    this.dryRun = dryRun;

    // TODO: This method of copying the source file into the target file requires
    // the entire thing to fit in memory at once. Not elegant.
    this.applyPatches = function() {
	console.dir("Loading input file: " + this.filename);
	var fileBuf = fs.readFileSync(this.filename);

	var tempFile;
	if (!this.dryRun) {
	    console.dir("Creating temp output file: " + this.tempFilename);
	    tempFile = fs.openSync(this.tempFilename, "w");
	    fs.writeSync(tempFile, fileBuf, 0, fileBuf.length, null);
	}

	for (var i = 0; i < this.patches.length; i++) {
	    console.dir("Applying patch " + (i+1) + " of " + this.patches.length);
	    var patch = this.patches[i];
	    if (!dryRun) {
		patch(tempFile);
	    }
	}

	if (!this.dryRun) {
	    fs.closeSync(tempFile);
	    console.dir("Saving output file: " + this.outputFilename);
	    fs.renameSync(this.tempFilename, this.outputFilename);
	} else {
	    console.dir("[DRY RUN] NOT saving output file: " + this.outputFilename);
	}
    }
    return this;
}


module.exports = Patcher;
