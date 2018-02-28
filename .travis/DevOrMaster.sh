#!/bin/bash

function devOrMaster()
{
 local result
 if [[ $TRAVIS_BRANCH = "development" ]]
 then 
     sh forDevBranch.sh
     result=$?
 else 
     if [[ $TRAVIS_BRANCH = "master" ]]
        then  
            sh forMasterBranch.sh
            result=$?
     fi 
 fi
 echo "$result"
}
$(devOrMaster)
