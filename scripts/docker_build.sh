#!/bin/bash

PROJECT_ROOT=$(cd `dirname "$0"` && git rev-parse --show-toplevel)

IMAGE_NAME=noiph/hurado

docker build \
    --tag ${IMAGE_NAME}:latest \
    --file $PROJECT_ROOT/Dockerfile \
    $PROJECT_ROOT
