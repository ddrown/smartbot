FROM nodejs-20
ADD . /home/node/app
RUN chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
RUN npm install
WORKDIR /home/node/app/slack
RUN npm install
ENTRYPOINT node index.js
