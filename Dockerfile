FROM node:21.6.2-slim

WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY .sequelizerc /app/.sequelizerc

RUN yarn install

COPY ./tsconfig.json /app/tsconfig.json
COPY ./.eslintrc.json /app/.eslintrc.json

ENTRYPOINT [ "yarn" ]
CMD [ "dev" ]
