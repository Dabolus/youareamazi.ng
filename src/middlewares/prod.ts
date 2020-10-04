import path from 'path';
import Application, { Middleware } from 'koa';
import logger from 'koa-morgan';
import compress from 'koa-compress';
import staticDir from 'koa-static';
import health from './health';
import icons from './icons';
import decode from '../helpers/decode';

const configureProdMiddlewares = async (hostname: string) => {
  const homeMiddleware = staticDir(path.join(__dirname, 'apps/home'));
  const motivationMiddleware = staticDir(
    path.join(__dirname, 'apps/motivation'),
  );

  const staticMiddleware: Middleware = async function (
    this: Application,
    ctx,
    next,
  ) {
    if (ctx.request.host === hostname) {
      return homeMiddleware.call(this, ctx, next);
    }

    return motivationMiddleware.call(this, ctx, next);
  };

  const nameMiddleware: Middleware = async (ctx, next) => {
    if (ctx.request.host === hostname) {
      return;
    }

    ctx.state = {
      ...ctx.state,
      /* EXAMPLE RESULT */
      // Our hostname:         example.com
      // Request's hostname:   foo_bar.example.com
      // RESULT:               name = 'Foo Bar'
      name: decode(
        ctx.request.host.slice(
          0,
          ctx.request.host.length - hostname.length - 1,
        ),
      ),
    };

    return next();
  };

  const renderMiddleware: Middleware = async (ctx) => {
    if (ctx.request.path !== '/' && ctx.request.path !== '/index.ejs') {
      return;
    }

    await ctx.render('index');
  };

  return [
    logger('short'),
    compress(),
    health(),
    staticMiddleware,
    nameMiddleware,
    icons(),
    renderMiddleware,
  ];
};

export default configureProdMiddlewares;
