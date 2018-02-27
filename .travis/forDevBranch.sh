#!/bin/bash

cd VkGroupBot;
npm install;
npm test;
grunt jshint;
cd ..;
cd TgBot;
python -m unittest tests/*.py;
cd ..;
