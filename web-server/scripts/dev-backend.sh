#!/bin/sh

./scripts/wait-for-it.sh $PG_HOST:5432 --timeout=30 --strict -- echo "postgres up and running"

if ! which ts-node-dev > /dev/null ; then
    npm install
fi

ts-node-dev --respawn src/index.ts
