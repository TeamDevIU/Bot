#!/bin/bash

echo "DEV"
cd VkGroupBot;
npm install;
npm test;
grunt jshint;
cd ..;
cd TgBot;
python3.6 -m unittest tests/*.py;
cd ..;
