#!/bin/bash

dt=$(date '+%Y/%m/%d %H:%M:%S')
cd /home/ubuntu/OpenCovidMY/

git pull
git checkout auto 
git pull

#sudo chown -Rc $UID .

cd /home/ubuntu/OpenCovidMY/crawler/src

npm install --include-dev 
npm start

cd /home/ubuntu/OpenCovidMY/
#sudo chown -Rc $UID .

git add -A
sudo -u ubuntu git commit -a -m "[Auto] $dt"

#git remote add origin git@github.com:kwongtn/OpenCovidMY.git

sudo -u ubuntu git push 
