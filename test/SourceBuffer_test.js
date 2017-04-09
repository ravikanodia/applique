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

    describe('crc check', function() {
	it('returns the correct crc32 value for a buffer', function() {
	    var buf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\n"));
	    buf.crc().toString(16).should.equal("f8400c77");
	});
    });
});
