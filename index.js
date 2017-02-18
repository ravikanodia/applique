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
parser.addArgument(
    ['-d', '--dry-run'],
    {
	help: 'dry run (don\'t save output file)'
    });

var args = parser.parseArgs();

var parser = ipsParser(args.patch);
var patches = parser.getAllPatches();

var patcher = patcher(args.file, patches, args.output, args.dry_run);
patcher.applyPatches();

