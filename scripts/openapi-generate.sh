#!/bin/sh

./scripts/dev-run.backend.sh scripts/generate-openapi.sh

cp web-server/src/types/openapi-generated.ts web-client/src/types/openapi-generated.ts