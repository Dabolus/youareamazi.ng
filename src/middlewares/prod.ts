import path from 'path';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import ejs from 'koa-ejs';
import send from 'koa-send';
import webpack from 'webpack';
import webpackConfigs from '../../webpack.config';
import { Middleware } from 'koa';
import decode from '../helpers/decode';

const configureProdMiddlewares = async (hostname: string) => {
  const webpackMiddlewares = await Promise.all(
    webpackConfigs.map(webpackConfig =>
      koaWebpack({ compiler: webpack(webpackConfig) }),
    ),
  );

  const nameMiddleware: Middleware = async (ctx, next) => {
    if (ctx.request.host === hostname) {
      await send(ctx, 'src/static/home.html');
      return;
    }

    ctx.state = {
      ...ctx.state,
      /* EXAMPLE RESULT */
      // Our hostname:         example.com
      // Request's hostname:   foo.bar.example.com
      // RESULT:               name = 'Foo Bar'
      name: decode(
        ctx.request.host.slice(
          0,
          ctx.request.host.length - hostname.length - 1,
        ),
      ),
    };
  };

  return [...webpackMiddlewares, nameMiddleware];
};

export default configureProdMiddlewares;
