FROM node:21.6.2-slim

WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install

COPY .sequelizerc /app/.sequelizerc
COPY .mocharc.json /app/.mocharc.json

COPY ./tsconfig.json /app/tsconfig.json
COPY ./.eslintrc.json /app/.eslintrc.json

COPY ./tests /app/tests
COPY ./src /app/src

RUN yarn build

ENTRYPOINT [ "yarn" ]
CMD [ "start:prod" ]
