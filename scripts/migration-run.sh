#!/bin/sh

./scripts/dev-run.backend.sh npx ts-node /app/node_modules/typeorm/cli.js migration:run --dataSource /app/src/orm/data-source.ts