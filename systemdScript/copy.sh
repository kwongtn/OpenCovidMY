#!/bin/bash

cd /home/ubuntu/OpenCovidMY
systemctl disable openCovidCrawl.timer

chmod +x /home/ubuntu/OpenCovidMY/systemdScript/openCovidCrawl.sh

cp -f /home/ubuntu/OpenCovidMY/systemdScript/openCovidCrawl.service /etc/systemd/system/
cp -f /home/ubuntu/OpenCovidMY/systemdScript/openCovidCrawl.timer /etc/systemd/system/

systemctl enable openCovidCrawl.timer
systemctl start openCovidCrawl.timer

journalctl -u /etc/systemd/system/openCovidCrawl.service

