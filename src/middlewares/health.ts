import { Middleware } from 'koa';

const health: () => Middleware = () => async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.status = 204;
    return;
  }

  return next();
};

export default health;
