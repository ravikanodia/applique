#!/usr/bin/env node
'use strict';

const fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var ipsParser = require('./parsers/ipsParser');
var upsParser = require('./parsers/upsParser');
var patcher = require('./patcher');
var File = require('./lib/File');
var SourceBuffer = require('./lib/SourceBuffer');

var parser = new ArgumentParser({
	version: '0.0.0',
	addHelp: true,
        description: 'Apply an IPS patch to a file.'
    });
parser.addArgument(
    ['-p', '--patch'],
    {
	help: 'patch file'
    });
parser.addArgument(
    ['-f', '--file'],
    {
	help: 'base file'
    });
parser.addArgument(
    ['-o', '--output'],
    {
	help: 'output file'
    });
parser.addArgument(
    ['-t', '--type'],
    {
	choices: ['ips', 'ups'],
	help: 'patch type',
    });
parser.addArgument(
    ['-d', '--dry-run'],
    {
	help: 'dry run (don\'t save output file)'
    });

var args = parser.parseArgs();

//var inputFile = File(args.file);
//var patchFile = File(args.patch);
//console.log("input filesize is: " + inputFile.getFileLength());
//console.log("patch filesize is: " + patchFile.getFileLength());

var parser;
var inputSource = SourceBuffer(fs.readFileSync(args.file));
var patchSource = SourceBuffer(fs.readFileSync(args.patch));
if (args.type == 'ups') {
    parser = upsParser(inputSource, patchSource, args.output);
} else {    
    parser = ipsParser(inputSource, patchSource, args.output);
}
parser.applyAllPatches();

