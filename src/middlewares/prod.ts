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

    const encodedName = ctx.request.host.slice(
      0,
      ctx.request.host.length - hostname.length - 1,
    );

    ctx.state = {
      ...ctx.state,
      /* EXAMPLE RESULT */
      // Our hostname:         example.com
      // Request's hostname:   foo_bar.example.com
      // RESULT:               name = 'Foo Bar'
      name: decode(encodedName),
      encodedName,
    };

    return next();
  };

  const renderMiddleware: Middleware = async (ctx) => {
    const [, path] = ctx.request.path.split('/');

    if (!path || path.startsWith('index')) {
      await ctx.render('index');
    } else if (path.startsWith('sitemap')) {
      await ctx.render('sitemap');
    } else if (path.startsWith('robots')) {
      await ctx.render('robots');
    }
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
