#!/bin/bash

cd /home/ubuntu/OpenCovidMY

cp /home/ubuntu/OpenCovidMY/systemdScript/openCovidCrawl.service /etc/systemd/system/
cp /home/ubuntu/OpenCovidMY/systemdScript/openCovidCrawl.timer /etc/systemd/system/

systemctl enable openCovidCrawl.timer
systemctl start openCovidCrawl.timer

journalctl -u openCovidCrawl*

