#!/bin/bash

cd VkGroupBot;
npm install;
npm test;
grunt jshint;
cd ..;
