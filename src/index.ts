#!/usr/bin/env node

import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import webpack from 'webpack';
import webpackConfigs from '../webpack.config';

const start = () =>
  new Promise(async (resolve, reject) => {
    const port = process.env.PORT || 4416;
    const app = new Koa();

    const middlewares = await Promise.all(
      webpackConfigs.map(webpackConfig =>
        koaWebpack({ compiler: webpack(webpackConfig) }),
      ),
    );

    middlewares.forEach(middleware => app.use(middleware));
    app.use(async ctx => {
      ctx.body = 'Hello, World!';
    });

    app
      .listen(port)
      .once('listening', () => {
        console.log(`App listening on port ${port}...`);
        resolve();
      })
      .once('error', reject);
  });

start();
