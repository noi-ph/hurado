#!/bin/sh

PROJECT_ROOT=$(cd `dirname "$0"` && git rev-parse --show-toplevel)
SERVER_ROOT=$PROJECT_ROOT/web-server
CLIENT_ROOT=$PROJECT_ROOT/web-client

openapi-typescript $SERVER_ROOT/src/types/openapi.yaml > $SERVER_ROOT/src/types/openapi-generated.ts

cp $SERVER_ROOT/src/types/openapi-generated.ts $CLIENT_ROOT/src/types/openapi-generated.ts