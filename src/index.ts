#!/usr/bin/env node

import path from 'path';
import Koa from 'koa';
import ejs from 'koa-ejs';
import configureProdMiddlewares from './middlewares/prod';
import configureDevMiddlewares from './middlewares/dev';

const hostname = 'youareamazi.ng';

const start = () =>
  new Promise(async (resolve, reject) => {
    const port = process.env.PORT || 4416;
    const app = new Koa();

    ejs(app, {
      root: path.join(__dirname, 'apps/motivation'),
      layout: false,
      debug: true,
      async: true,
      viewExt: 'ejs',
    });

    const middlewares =
      process.env.NODE_ENV === 'production'
        ? await configureProdMiddlewares(hostname)
        : await configureDevMiddlewares();

    middlewares.forEach(middleware => app.use(middleware));

    app
      .listen(port)
      .once('listening', () => {
        console.log(`App listening on port ${port}...`);
        resolve();
      })
      .once('error', reject);
  });

start();
