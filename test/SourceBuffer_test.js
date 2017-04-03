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

    describe('crc check', function() {
	it('returns the correct crc32 value for a buffer', function() {
	    var buf = SourceBuffer(Buffer("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\n"));
	    buf.crc().toString(16).should.equal("f8400c77");
	});
    });
});
