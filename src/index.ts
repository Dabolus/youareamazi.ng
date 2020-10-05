import Koa from 'koa';
import path from 'path';
import ejs from './middlewares/ejs';
import configureProdMiddlewares from './middlewares/prod';
import configureDevMiddlewares from './middlewares/dev';

const hostname = 'youareamazi.ng';
const isDev = process.env.NODE_ENV !== 'production';

const templateToTypeMap: Record<string, string> = {
  index: 'html',
  sitemap: 'xml',
  robots: 'txt',
};

const start = () =>
  new Promise<void>(async (resolve, reject) => {
    const port = process.env.PORT || 4416;
    const app = new Koa();

    ejs(app, {
      cache: false,
      type: (template) => templateToTypeMap[template],
      ...(!isDev && {
        root: path.resolve(__dirname, 'apps/motivation'),
      }),
    });

    const middlewares = isDev
      ? await configureDevMiddlewares()
      : await configureProdMiddlewares(hostname);

    middlewares.forEach((middleware) => app.use(middleware));

    app
      .listen(port)
      .once('listening', () => {
        console.log(`App listening on port ${port}...`);
        resolve();
      })
      .once('error', reject);
  });

start();
