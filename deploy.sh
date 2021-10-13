#!/bin/bash

cd /var/www/mongrel/api

pm2 delete api

rm -rf dist node_modules yarn.lock

yarn

yarn build

pm2 start