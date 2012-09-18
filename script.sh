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
jscoverage --no-instrument=scripts/js/vendor $1 coverage-build/app

echo "copying test dir..."

cp -r $1/../test coverage-build/test

echo "running phantomjs..."
phantomjs script.js run --config config.js

echo "finished!"

exit

