#!/bin/bash

cd /var/www/mongrel/api

pm2 delete api

rm -rf dist node_modules yarn.lock

# Build project
yarn

yarn build

pm2 start

# Restart nginx
service nginx restart