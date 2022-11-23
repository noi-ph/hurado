#!/bin/sh

chmod +x ./scripts/wait-for-it.sh

./scripts/wait-for-it.sh $PG_HOST:5432 --timeout=30 --strict -- echo "postgres is up and running"

if ! which ts-node-dev > /dev/null ; then
    npm install
fi

npx ts-node-dev --respawn src/index.ts