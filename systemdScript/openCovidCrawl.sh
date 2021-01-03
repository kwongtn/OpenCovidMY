#!/bin/bash

dt=$(date '+%Y/%m/%d %H:%M:%S')
cd /home/ubuntu/OpenCovidMY/crawler/src

git pull
git checkout auto 
git pull

npm install --include-dev 
npm start

git commit -a -m "[Auto] $dt"

#git remote add origin git@github.com:kwongtn/OpenCovidMY.git

git push 
