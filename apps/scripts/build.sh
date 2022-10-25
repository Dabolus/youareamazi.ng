#!/bin/bash

for i in src/*; do cd $i; vite build --config ../../vite.config.ts --emptyOutDir; cd ../..; done
