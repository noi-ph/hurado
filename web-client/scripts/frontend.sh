#!/bin/sh

if ! which next > /dev/null ; then
    npm install
fi

git init
npx next dev