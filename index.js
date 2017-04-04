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
	choices: ['ips', 'ups'],
	help: 'patch type',
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

var inputSource = SourceBuffer(fs.readFileSync(args.file));
var patchSource = SourceBuffer(fs.readFileSync(args.patch));
var outputBuffer = SourceBuffer();
var parserFactory = ParserFactory(inputSource, patchSource, outputBuffer, args);
var parser = parserFactory.getParser();
parser.applyAllPatches();

outputBuffer.saveToFile(args.output);
