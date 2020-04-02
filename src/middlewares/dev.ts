import path from 'path';
import koaWebpack from 'koa-webpack';
import webpack, { Compiler } from 'webpack';
import webpackConfigs, { baseLibPath } from '../../webpack.config.apps';
import { Middleware } from 'koa';
import health from './health';
import decode from '../helpers/decode';

const configureDevMiddlewares = async () => {
  const [homeConfig, motivationConfig] = webpackConfigs;

  const webpackMiddleware = await koaWebpack({
    compiler: (webpack(webpackConfigs) as unknown) as Compiler,
    devMiddleware: {
      publicPath: '/',
    },
  });

  const nameMiddleware: Middleware = async (ctx, next) => {
    if (!ctx.request.path.startsWith('/motivation')) {
      return next();
    }

    const filePath = path.resolve(baseLibPath, ctx.request.path.slice(1));

    if (webpackMiddleware.devMiddleware.fileSystem.existsSync(filePath)) {
      return next();
    }

    ctx.state = {
      ...ctx.state,
      /* EXAMPLE RESULT */
      // Request path:         /motivation/foo.bar
      // RESULT:               name = 'Foo Bar'
      name: decode(ctx.request.path.slice(12)),
    };

    return next();
  };

  const renderMiddleware: Middleware = async (ctx, next) => {
    if (!ctx.request.path.startsWith('/motivation')) {
      return next();
    }

    const homeFiles = webpackMiddleware.devMiddleware.fileSystem.readdirSync(
      homeConfig.output!.path!,
    );
    const motivationFiles = webpackMiddleware.devMiddleware.fileSystem.readdirSync(
      motivationConfig.output!.path!,
    );

    if (
      homeFiles.some(file => ctx.request.path.includes(file)) ||
      motivationFiles.some(file => ctx.request.path.includes(file))
    ) {
      return next();
    }

    const indexToRender = path.resolve(
      motivationConfig.output!.path!,
      'index.ejs',
    );

    const template = webpackMiddleware.devMiddleware.fileSystem.readFileSync(
      indexToRender,
      'utf8',
    );

    await ctx.render(template);
  };

  return [health(), webpackMiddleware, nameMiddleware, renderMiddleware];
};

export default configureDevMiddlewares;
