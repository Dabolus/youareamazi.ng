import Koa from 'koa';
import path from 'path';
import ejs from './middlewares/ejs';
import configureProdMiddlewares from './middlewares/prod';
import configureDevMiddlewares from './middlewares/dev';

const hostname = 'youareamazi.ng';

const start = () =>
  new Promise(async (resolve, reject) => {
    const port = process.env.PORT || 4416;
    const app = new Koa();

    ejs(app, {
      root: path.resolve(__dirname, 'apps/motivation'),
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
