const SourceBuffer = require('../lib/SourceBuffer');
const UpsParser = require('../parsers/UpsParser.js');
const fs = require('fs');


function randomFilename(baseFilename) {
    var str = baseFilename || '';
    for (var i = 0; i < 10; i++) {
	str = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + str;
    }

    return str;
}

describe('UpsParser', function() {

    it('applies a data patch correctly', function(done) {
	var inputBuf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\n"));
	var outputBuf = SourceBuffer();
	var patchBuf = SourceBuffer(fs.readFileSync('test/patches/alpha-la.ups'));

	var parser = UpsParser(inputBuf, patchBuf, outputBuf, { checks: 'enforce' });
	parser.applyAllPatches();
	var expectBuf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLaLiLuLeLoVWXYZ0123456789\n"));
	console.log(expectBuf);
	outputBuf.equals(expectBuf).should.equal(true);
				   
	done();
    });

});
