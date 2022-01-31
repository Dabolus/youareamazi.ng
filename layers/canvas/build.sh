#!/bin/bash

docker build -t canvas-layer .

docker run --rm --mount type=bind,source="$(pwd)",target=/out canvas-layer
