import { Middleware } from 'koa';

const health: () => Middleware = () => async ctx => {
  if (ctx.path === '/health') {
    ctx.status = 204;
    return;
  }
};

export default health;
