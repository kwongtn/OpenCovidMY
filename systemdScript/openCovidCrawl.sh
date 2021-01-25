#!/bin/bash

# Defines the datetime variable
dt=$(date '+%Y/%m/%d %H:%M:%S')

# Getting into the repository
cd /home/ubuntu/OpenCovidMY/

# Updating repository
git pull
git checkout auto 
git pull

#sudo chown -Rc $UID .

# Start crawler sequence
cd /home/ubuntu/OpenCovidMY/crawler/src
npm install --include-dev 
npm start

# Start combiner sequence
cd /home/ubuntu/OpenCovidMY/combiner/src
npm install --include-dev 
npm start

cd /home/ubuntu/OpenCovidMY/
#sudo chown -Rc $UID .

# Add everything changed and commit
git add -A
git commit -a -m "[Auto] $dt"

#git remote add origin git@github.com:kwongtn/OpenCovidMY.git

# Push using the "ubuntu" account
sudo -u ubuntu git push 
