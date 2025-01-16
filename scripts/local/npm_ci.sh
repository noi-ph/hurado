#!/bin/bash

PROJECT_ROOT=$(cd `dirname "$0"` && git rev-parse --show-toplevel)

docker run \
    -it \
    --env-file "$PROJECT_ROOT/.env" \
    -v "$PROJECT_ROOT:/app" \
    -w /app \
    --user $(id -u):$(id -g) \
    noiph/hurado:latest npm ci
