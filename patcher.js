const fs = require('fs');

var Patcher = function(filename, patches, outputFilename, dryRun) {
    this.filename = filename;
    this.patches = patches;
    this.outputFilename = outputFilename;
    this.dryRun = dryRun;

    this.applyPatches = function() {
	console.dir("Loading input file: " + this.filename);
	var fileBuf = fs.readFileSync(this.filename);

	for (var i = 0; i < this.patches.length; i++) {
	    console.dir("Applying patch " + (i+1) + " of " + this.patches.length);

	    var patch = this.patches[i];
	    patch(fileBuf);
	}

	if (!this.dryRun) {
	    console.dir("Saving output file: " + this.outputFilename);
	    fs.writeFileSync(this.outputFilename, fileBuf);
	} else {
	    console.dir("[DRY RUN] NOT saving output file: " + this.outputFilename);
	}
    }
    return this;
}


module.exports = Patcher;
