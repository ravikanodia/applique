#!/usr/bin/env node
'use strict';

const fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var ParserFactory = require('./parsers/ParserFactory');
var SourceBuffer = require('./lib/SourceBuffer');

var argParser = new ArgumentParser({
	version: '0.0.0',
	addHelp: true,
        description: 'Apply an IPS patch to a file.'
    });
argParser.addArgument(
    ['-p', '--patch'],
    {
	help: 'patch file'
    });
argParser.addArgument(
    ['-f', '--file'],
    {
	help: 'base file'
    });
argParser.addArgument(
    ['-o', '--output'],
    {
	help: 'output file'
    });
argParser.addArgument(
    ['-t', '--type'],
    {
	choices: ['auto', 'ips', 'ups'],
	defaultValue: ['auto'],
	help: 'patch type'
    });
argParser.addArgument(
    ['-m', '--mode'],
    {
	choices: ['apply', 'create'],
	defaultValue: 'apply',
	help: 'apply a patch to a file, or create a patch based on two files'
    });
argParser.addArgument(
    ['-c', '--checks'],
    {
	choices: ['ignore', 'warn', 'enforce'],
	defaultValue: 'enforce',
	help: 'enforce integrity checks (varies by patch type)'
    });
argParser.addArgument(
    ['-d', '--dry-run'],
    {
	help: 'dry run (don\'t save output file)'
    });

var args = argParser.parseArgs();

var initialFile = SourceBuffer(fs.readFileSync(args.file));
var patchFile;
var targetFile;
var saveBuffer;
if (args.mode === 'apply') {
    patchFile = SourceBuffer(fs.readFileSync(args.patch));
    saveBuffer = targetFile = SourceBuffer();
} else if (args.mode === 'create') {
    targetFile = SourceBuffer(fs.readFileSync(args.output));
    saveBuffer = patchFile = SourceBuffer();
}

var parserFactory = ParserFactory(initialFile, patchFile, targetFile, args);
var parser = parserFactory.getParser();
parser.applyAllPatches();

saveBuffer.saveToFile(args.output);
