#!/bin/bash

rm -rf build
wget https://github.com/samizdatco/skia-canvas/releases/download/v3.0.8/aws-lambda-arm64.zip
unzip aws-lambda-arm64.zip -d build
rm aws-lambda-arm64.zip
