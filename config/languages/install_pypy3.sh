#!/bin/bash

set -e

# Remove existing PyPy3 installations
if [ -d /opt/lang/pypy3.11 ]; then
    rm -r /opt/lang/pypy3.11
fi

# Remove existing symlinks
FILES=(/usr/bin/pypy /usr/bin/pypy3)
for FILE in ${FILES[@]}; do
    if [ -L $FILE ]; then
        rm $FILE
    fi
done

PYPY3_DOWNLOAD_URL=https://downloads.python.org/pypy/pypy3.11-v7.3.19-linux64.tar.bz2

curl -o /tmp/pypy3.tar.gz $PYPY3_DOWNLOAD_URL

mkdir -p /opt/lang/pypy3.11

tar -xjf /tmp/pypy3.tar.gz -C /opt/lang/pypy3.11 --strip-components=1

ln -s /opt/lang/pypy3.11/bin/pypy3.11 /usr/bin/pypy
ln -s /opt/lang/pypy3.11/bin/pypy3.11 /usr/bin/pypy3
