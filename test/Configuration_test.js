const Configuration = require('../lib/Configuration');

describe('Configuration', function() {

  var configObject = {
    file: "input_filename.txt",
    patch: "patch_file_here.ips",
    output: "output_goes_here.txt",
    mode: "apply",
    type: "ips"
  };

  describe('fromObject', function() {
    it('gives things the right name', function(done) {
      var config = Configuration.fromObject(configObject);
      config.inputFilename.should.equal("input_filename.txt");
      config.patchFilename.should.equal("patch_file_here.ips");
      config.outputFilename.should.equal("output_goes_here.txt");
      config.mode.should.equal("apply");
      config.type.should.equal("ips");

      done();
    });

  });

  describe('fromArguments', function() {
    it('puts things in the right place', function(done) {
      var config = Configuration.fromArguments(
        "input_filename.txt",
        "patch_file_here.ips",
        "output_goes_here.txt",
        "apply",
        "ips");

      config.inputFilename.should.equal("input_filename.txt");
      config.patchFilename.should.equal("patch_file_here.ips");
      config.outputFilename.should.equal("output_goes_here.txt");
      config.mode.should.equal("apply");
      config.type.should.equal("ips");

      done();
    });
  });

  describe('suggestFilename', function() {
    var configuration;
    beforeEach(function() {
      configuration = Configuration.fromObject(configObject);
    });

    it('suggests the right filename', function(done) {
      configuration.suggestFilename().should.equal("patch_file_here.txt");
      done();
    });
  });
});
