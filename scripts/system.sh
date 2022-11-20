#!/bin/sh

if ! which husky > /dev/null ; then
    npm install
fi

npx husky install
cat