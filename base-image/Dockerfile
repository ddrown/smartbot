# for x86-64
#ARG SOURCEIMG=node
# for arm32 (Raspberry Pi)
ARG SOURCEIMG=arm32v7/node
# for arm64 (doesn't work on pi)
#ARG SOURCEIMG=arm64v8/node
FROM ${SOURCEIMG}:20
RUN apt update && apt -y dist-upgrade
