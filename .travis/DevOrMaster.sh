#!/bin/bash

function DevOrMaster()
{
 local result
 if [ [$TRAVIS_BRANCH = "development"] ]
 then 
     result = ./.travis/forDevBranch.sh
 else 
     if [ [$TRAVIS_BRANCH = "master"] ]
        then  
            result = ./.travis/forMasterBranch.sh
     fi 
 fi
 echo "$result"
}
$(DevOrMaster)
