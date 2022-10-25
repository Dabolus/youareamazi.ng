#!/bin/bash

for i in layers/*; do cd $i; rm -rf build; ./build.sh; cd ../..; done
