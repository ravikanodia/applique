#!/usr/bin/env node
'use strict';

var ArgumentParser = require('argparse').ArgumentParser;
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

var args = parser.parseArgs();
console.dir(args);
