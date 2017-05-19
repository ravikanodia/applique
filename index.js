#!/usr/bin/env node
'use strict';

const fs = require('fs');
var ArgumentParser = require('argparse').ArgumentParser;
var Configuration = require('./lib/Configuration');
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
var configuration = Configuration.fromObject(args);

var initialFile = SourceBuffer(fs.readFileSync(configuration.inputFilename));
var patchFile;
var targetFile;
var saveBuffer;
var saveFile;
if (args.mode === 'apply') {
    patchFile = SourceBuffer(fs.readFileSync(configuration.patchFilename));
    saveBuffer = targetFile = SourceBuffer();
    saveFile = configuration.outputFilename;
} else if (args.mode === 'create') {
    targetFile = SourceBuffer(fs.readFileSync(configuration.outputFilename));
    saveBuffer = patchFile = SourceBuffer();
    saveFile = configuration.patchFilename;
}

var parserFactory = ParserFactory(initialFile, patchFile, targetFile, configuration);
var parser = parserFactory.getParser();
parser.applyAllPatches();

saveBuffer.saveToFile(saveFile);
