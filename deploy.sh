#!bin/bash
 
 # Install packages
 yarn

 # Build project
yarn build

# Restart service
pm2 restart api

# Restart nginx
service nginx restart
