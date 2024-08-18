FROM node:20-bullseye

# Setup workdir
RUN mkdir /isolate/
WORKDIR /isolate/

# Download dependencies
RUN apt-get update
RUN apt-get install -y pkg-config libcap-dev libsystemd-dev git make gcc

# Checkout and get isolate
RUN git clone https://github.com/ioi/isolate /isolate/

# Build isolate
RUN make isolate
RUN make install

RUN cp /isolate/isolate /bin/isolate

WORKDIR /app/
