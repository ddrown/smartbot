#!/bin/sh

DESTDIR=smartbot:/home/node/app
if [ "$1" = "config.json" ]; then
  DESTDIR="${DESTDIR}/smartbot"
fi

sudo docker cp "$1" $DESTDIR/$1
