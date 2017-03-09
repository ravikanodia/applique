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
	done();
    });

    it('applies a data patch correctly', function(done) {
	var inputBuf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
	var outputBuf = SourceBuffer();
	var patchBuf = SourceBuffer(fs.readFileSync('test/patches/alpha-la.ips'));

	var parser = IpsParser(inputBuf, patchBuf, outputBuf);
	parser.applyAllPatches();
	var expectBuf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLaLiLuLeLoVWXYZ0123456789"));
	outputBuf.equals(expectBuf).should.equal(true);
				   
	done();
    });

    it('applies a run-length encoded patch correctly', function(done) {
	done();
    });

    
});
