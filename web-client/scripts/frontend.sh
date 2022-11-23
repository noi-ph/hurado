#!/bin/sh

if ! which next > /dev/null ; then
    npm install
fi

npx next dev