import path from 'path';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import ejs from 'koa-ejs';
import send from 'koa-send';
import webpack from 'webpack';
import webpackConfigs from '../../webpack.config';
import { Middleware } from 'koa';
import health from './health';
import decode from '../helpers/decode';

const configureDevMiddlewares = async () => {
  const [homeConfig, motivationConfig] = webpackConfigs;

  const [homeMiddleware, motivationMiddleware] = await Promise.all([
    koaWebpack({ compiler: webpack(homeConfig) }),
    koaWebpack({ compiler: webpack(motivationConfig) }),
  ]);

  const nameMiddleware: Middleware = async (ctx, next) => {
    if (ctx.request.path.startsWith('/motivation/')) {
      ctx.state = {
        ...ctx.state,
        /* EXAMPLE RESULT */
        // Request path:         /motivation/foo.bar
        // RESULT:               name = 'Foo Bar'
        name: decode(ctx.request.path.slice(12)),
      };
    }

    return next();
  };

  const renderMiddleware: Middleware = async ctx => {
    if (ctx.request.path.startsWith('/home')) {
      const index = path.resolve(homeConfig.output!.path!, 'index.html');

      ctx.response.type = 'html';
      ctx.response.body = homeMiddleware.devMiddleware.fileSystem.createReadStream(
        index,
      );

      return;
    }

    if (!ctx.request.path.startsWith('/motivation') || !('name' in ctx.state)) {
      ctx.response.redirect('/home');
      return;
    }
  };

  return [
    health(),
    homeMiddleware,
    motivationMiddleware,
    nameMiddleware,
    renderMiddleware,
  ];
};

export default configureDevMiddlewares;
