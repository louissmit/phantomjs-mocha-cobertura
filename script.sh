#!/bin/bash

if [ ! $1 ]; then
	echo "Provide app directory"
	exit
fi

if [ ! -d $1 ]; then
	echo "Directory does not exists"
	exit
fi 

echo "creating build dirs..."
mkdir coverage-build
mkdir coverage-build/app

echo "running jscoverage..."
jscoverage --no-instrument=scripts/js/vendor --no-instrument=scripts/js/test $1 coverage-build/app

echo "running phantomjs..."
phantomjs phantomjs-mocha-cobertura/test_result_recorder.js run --config phantomjs-mocha-cobertura/config.js

echo "finished!"
rm -r coverage-build
exit

