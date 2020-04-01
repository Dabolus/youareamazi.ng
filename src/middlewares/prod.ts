import send from 'koa-send';
import { Middleware } from 'koa';
import health from './health';
import decode from '../helpers/decode';

const configureProdMiddlewares = async (hostname: string) => {
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

  const renderMiddleware: Middleware = async ctx => {};

  return [health(), nameMiddleware];
};

export default configureProdMiddlewares;
