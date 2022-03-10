# This is just a simple docker file

FROM node:12.22

RUN mkdir /opt/megabot
COPY . /opt/megabot
WORKDIR /opt/megabot
RUN npm i --production
CMD ["node", "index.js"]
