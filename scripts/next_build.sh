#!/bin/bash

# Runs the `next build`` command inside a docker container
# The final output will be at ~/.next/ which docker-compose.production.yml will know how to use

set -e

function run_inside() {
    cd /app

    # This builds the next.js app and outputs the files to the /app/.next/ directory
    # Since /app is mounted as a volume, the files in /app/.next/ will be available on the host machine
    npm ci
    npm run build
}

function run_outside() {
    PROJECT_ROOT=$(cd `dirname "$0"` && git rev-parse --show-toplevel)
    docker run \
        -it \
        --env-file "$PROJECT_ROOT/.env" \
        -v "$PROJECT_ROOT:/app" \
        -w /app \
        noiph/hurado:latest ./scripts/next_build.sh inside

    if [ -d "$PROJECT_ROOT/build.bak" ]; then
        rm -rf "$PROJECT_ROOT/build.bak"
    fi
    if [ -d "$PROJECT_ROOT/build" ]; then
        mv "$PROJECT_ROOT/build" "$PROJECT_ROOT/build.bak"
    fi
    mv "$PROJECT_ROOT/.next" "$PROJECT_ROOT/build"
}


if [ "$1" == "inside" ]; then
    run_inside
else
    run_outside
fi
