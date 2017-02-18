#!/usr/bin/env node
'use strict';

const fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var ipsParser = require('./parsers/ipsParser');
var patcher = require('./patcher');

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

var args = parser.parseArgs();
console.dir(args);

var parser = ipsParser(args.patch);
var patches = parser.getAllPatches();

var patcher = patcher(args.file, patches, args.output);
patcher.applyPatches();

