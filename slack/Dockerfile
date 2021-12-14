# for x86-64
#ARG SOURCEIMG=node
# for arm32 (Raspberry Pi)
ARG SOURCEIMG=arm32v7/node
FROM ${SOURCEIMG}:15
ADD . /home/node/app
RUN chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
RUN npm install
WORKDIR /home/node/app/slack
RUN npm install
ENTRYPOINT node index.js
