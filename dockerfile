FROM node:16-bullseye

WORKDIR /app
ENV PATH="${PATH}:/app/node_modules.bin"

EXPOSE 1000