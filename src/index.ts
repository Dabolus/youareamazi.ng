import Koa from 'koa';
import path from 'path';
import ejs from './middlewares/ejs';
import configureProdMiddlewares from './middlewares/prod';
import configureDevMiddlewares from './middlewares/dev';

const hostname = 'youareamazi.ng';
const isDev = process.env.NODE_ENV !== 'production';

const start = () =>
  new Promise(async (resolve, reject) => {
    const port = process.env.PORT || 4416;
    const app = new Koa();

    ejs(
      app,
      isDev
        ? undefined
        : {
            root: path.resolve(__dirname, 'apps/motivation'),
          },
    );

    const middlewares = isDev
      ? await configureDevMiddlewares()
      : await configureProdMiddlewares(hostname);

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
