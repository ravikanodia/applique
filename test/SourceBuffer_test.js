const SourceBuffer = require('../lib/SourceBuffer');

describe('SourceBuffer', function() {
    describe('when initialized', function() {
	it('stores a buffer', function(done) {
	    var sb = SourceBuffer(Buffer("abcdefg"));
	    sb.getLength().should.equal(7);
	    sb.readBytesAsBuffer(1)[0].should.equal('a'.charCodeAt(0));

	    done();
	});

	it('is empty no buffer was passed in', function(done) {
	    var sb = SourceBuffer();
	    sb.getLength().should.equal(0);

	    done();
	});
    });

    describe('comparison', function() {
	it('returns true if the other buffer holds the same content', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefg"));
	    var bBuf = SourceBuffer(Buffer("abcdefg"));

	    aBuf.equals(bBuf).should.equal(true);
	    done();
	});

	it('returns false if the other buffer holds differing content', function(done) {
    	    var aBuf = SourceBuffer(Buffer("abcdefg"));
	    var bBuf = SourceBuffer(Buffer("gfedcba"));

	    aBuf.equals(bBuf).should.equal(false);
	    done();
	});

	it('returns false if the other buffer is shorter', function(done) {
    	    var aBuf = SourceBuffer(Buffer("abcdefg"));
	    var bBuf = SourceBuffer(Buffer("abcde"));

	    aBuf.equals(bBuf).should.equal(false);
	    done();
	});

	it('returns false if the other buffer is longer', function(done) {
    	    var aBuf = SourceBuffer(Buffer("abcdefg"));
	    var bBuf = SourceBuffer(Buffer("abcdefghi"));

	    aBuf.equals(bBuf).should.equal(false);
	    done();
	});
    });

    describe('readUIntBE', function() {
	it('reads bytes as a big-endian unsigned integer', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefghijkl"));
	    // 'a' is ascii 97.
	    aBuf.readBytesAsUIntBE(1, "test integer", 0).should.equal(97);

	    // 'e' is ascii 101.
	    aBuf.readBytesAsUIntBE(1, "test integer", 4).should.equal(101);

	    // 'd' is ascii 100. 'e' is ascii 101.
	    // 100 * 256 + 101 = 25701
	    aBuf.readBytesAsUIntBE(2, "test integer", 3).should.equal(25701);

	    // 'g' -> 103. 'h' -> 104. 'i' -> '105'. 'j' -> '106'.
	    // 106 + 256 * 105 + 256 * 256 * 104 + 256 * 256 * 256 * 103 = 1734895978
	    aBuf.readBytesAsUIntBE(4, "test integer", 6).should.equal(1734895978);

	    done();
	});

	it('modifies the file\'s position when used in linear mode', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefghijkl"));
	    aBuf.readBytesAsUIntBE(4, "test integer", null);

	    aBuf.getPosition().should.equal(4);
	    done();
	});

	it('does not modify the file\'s position when used in non-linear mode', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefghijkl"));
	    aBuf.readBytesAsUIntBE(4, "test integer", 2);

	    aBuf.getPosition().should.equal(0);
	    done();
	});
    });

    describe('readUIntLE', function() {
	it('reads bytes as a big-endian unsigned integer', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefghijkl"));

	    // 'a' is ascii 97.
	    aBuf.readBytesAsUIntLE(1, "test integer", 0).should.equal(97);

	    // 'e' is ascii 101.
	    aBuf.readBytesAsUIntLE(1, "test integer", 4).should.equal(101);

	    // 'd' is ascii 100. 'e' is ascii 101.
	    // 100 + 256 * 101 = 25956
	    aBuf.readBytesAsUIntLE(2, "test integer", 3).should.equal(25956);

	    // 'g' -> 103. 'h' -> 104. 'i' -> '105'. 'j' -> '106'.
	    // 103 + 256 * 104 + 256 * 256 * 105 + 256 * 256 * 256 * 106
	    aBuf.readBytesAsUIntLE(4, "test integer", 6).should.equal(1785292903);

	    done();
	});

	it('modifies the file\'s position when used in linear mode', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefghijkl"));
	    aBuf.readBytesAsUIntLE(4, "test integer", null);

	    aBuf.getPosition().should.equal(4);
	    done();
	});

	it('does not modify the file\'s position when used in non-linear mode', function(done) {
	    var aBuf = SourceBuffer(Buffer("abcdefghijkl"));
	    aBuf.readBytesAsUIntLE(4, "test integer", 2);

	    aBuf.getPosition().should.equal(0);
	    done();
	});

    });

    describe('write', function() {
	var aBuf;
	var bBuf;
	var bString;
	var bNodeBuf;

	beforeEach(function() {
            aBuf = SourceBuffer(Buffer("abcdefghijklmnop"));
            bBuf = SourceBuffer(Buffer("012345"));
            bNodeBuf = Buffer.from("012345");
            bString = "012345";
	});

	it('copies another buffer into this one', function(done) {
            aBuf.write(bBuf);

	    aBuf.toString().should.equal("012345ghijklmnop");
	    done();
	});

	it('accepts a Node Buffer as the source', function(done) {
            aBuf.write(bNodeBuf);

            aBuf.toString().should.equal("012345ghijklmnop");
	    done();
	});

	it('accepts a string as the source', function(done) {
	    aBuf.write(bString);

	    aBuf.toString().should.equal("012345ghijklmnop");
            done();
	});

	it('accepts an offset', function(done) {
	    aBuf.write(bBuf, 2);

	    aBuf.toString().should.equal("ab012345ijklmnop");
	    done();
	});

        it('accepts a start position', function(done) {
	    aBuf.write(bBuf, null, 2);

	    aBuf.toString().should.equal("2345efghijklmnop");
            done();
        });

        it('accepts an end position', function(done) {
	    aBuf.write(bBuf, null, null, 2);

	    aBuf.toString().should.equal("01cdefghijklmnop");
            done();
        });

	it('accepts a start postition and an end position together', function(done) {
	    aBuf.write(bBuf, null, 2, 5);

	    aBuf.toString().should.equal("234defghijklmnop");
	    done();
	});

	it('can write past the end of the buffer', function(done) {
	    aBuf.write(bBuf, 15);
	    aBuf.toString().should.equal("abcdefghijklmno012345");

	    done();
	});

	it('pads with zero bytes past the end of the buffer if necessary', function(done) {
	    aBuf.write(bBuf, 20);
	    aBuf.toString().should.equal("abcdefghijklmnop\u0000\u0000\u0000\u0000012345");

	    done();
	});

	it('modifies the position when used in linear mode', function (done) {
	    aBuf.write(bBuf, null);
	    aBuf.getPosition().should.equal(6);

	    // Range is non-inclusive, so [2, 5] is 3 bytes.
	    aBuf.write(bBuf, null, 2, 5);
	    aBuf.getPosition().should.equal(9);

	    done();
	});

	it('does not modify the position when used in nonlinear mode', function(done) {
	    aBuf.write(bBuf, 3);
	    aBuf.getPosition().should.equal(0);

	    aBuf.write(bString, 6, 2, 3);
	    aBuf.getPosition().should.equal(0);

	    done();
	});
    });

    describe('crc check', function() {
	it('returns the correct crc32 value for a buffer', function() {
	    var buf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\n"));
	    buf.crc().toString(16).should.equal("f8400c77");
	});
    });
});
