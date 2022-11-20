#!/bin/sh

if ! which husky > /dev/null ; then
    npm install
fi

cat