#!/bin/bash

# Defines the datetime variable
dt=$(date '+%Y/%m/%d %H:%M:%S')

# Getting into the repository
cd /root/OpenCovidMY/

# Updating repository
git pull
git checkout auto 
git pull

#sudo chown -Rc $UID .

# Start crawler sequence
cd /root/OpenCovidMY/crawler/src
npm install --include-dev 
npm start

# Start combiner sequence
cd /root/OpenCovidMY/combiner/src
npm install --include-dev 
npm start

cd /root/OpenCovidMY/
#sudo chown -Rc $UID .

# Add everything changed and commit
git add -A
git commit -a -m "[Auto] $dt"

#git remote add origin git@github.com:kwongtn/OpenCovidMY.git

# Push using the "ubuntu" account
git push 
