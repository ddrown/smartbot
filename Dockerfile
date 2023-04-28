FROM nodejs-20
WORKDIR /home/node/app
ADD . /home/node/app
RUN chown -R node:node /home/node/app
USER node
RUN npm install
COPY irc.js.patch ./
RUN patch -p0 <irc.js.patch
COPY config.json smartbot/
ENTRYPOINT node index.js
