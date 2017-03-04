const SourceBuffer = require('../lib/SourceBuffer');
const IpsParser = require('../parsers/IpsParser.js');
const fs = require('fs');


function randomFilename(baseFilename) {
    var str = baseFilename || '';
    for (var i = 0; i < 10; i++) {
	str = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + str;
    }

    return str;
}

//function testIpsPatch(inputFilename, patchFilename, goldenFilename) {
//    var inputFile = File(inputFile);
//    var patchFile = File(patchFile);
//     var outputFile = randomFilename(goldenFilename);

describe('IpsParser', function() {
    it('applies a no-op correctly', function(done) {
	var inputBuf = SourceBuffer(Buffer("abcdefg"));
	var outputBuf = SourceBuffer();
	var patchBuf = SourceBuffer(fs.readFileSync('test/patches/noop.ips'));

	var parser = IpsParser(inputBuf, patchBuf, outputBuf);
	parser.applyAllPatches();

	outputBuf.equals(inputBuf).should.equal(true);
	
//	var onePlusOne = 1 + 1;
//	onePlusOne.should.equal(2);
	done();
    });
});
