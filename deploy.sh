#!/bin/bash

cd /var/www/mongrel/api

pm2 delete dashboard

rm -rf .next node_modules yarn.lock

yarn

yarn build

pm2 start