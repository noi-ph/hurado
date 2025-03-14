#!/bin/bash

set -e

# Remove existing Java installations
if [ -d /opt/lang/java-23 ]; then
    rm -r /opt/lang/java-23
fi

# Remove existing symlinks
FILES=(/usr/bin/java /usr/bin/javac /usr/bin/jar)
for FILE in ${FILES[@]}; do
    if [ -L $FILE ]; then
        rm $FILE
    fi
done

JAVA_DOWNLOAD_URL=https://download.java.net/java/GA/jdk23.0.2/6da2a6609d6e406f85c491fcb119101b/7/GPL/openjdk-23.0.2_linux-x64_bin.tar.gz

curl -o /tmp/openjdk.tar.gz $JAVA_DOWNLOAD_URL

mkdir -p /opt/lang/java-23

tar -xzf /tmp/openjdk.tar.gz -C /opt/lang/java-23 --strip-components=1

ln -s /opt/lang/java-23/bin/java /usr/bin/java
ln -s /opt/lang/java-23/bin/javac /usr/bin/javac
ln -s /opt/lang/java-23/bin/jar /usr/bin/jar

rm /tmp/openjdk.tar.gz
