#!/bin/sh

./scripts/dev-run.postgres.sh 'PGPASSWORD=$POSTGRES_PASSWORD psql $POSTGRES_DB -U $POSTGRES_USER'