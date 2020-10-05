import { promises as fs } from 'fs';
import path from 'path';
import ejs, { AsyncTemplateFunction } from 'ejs';
import Application from 'koa';

const parentResolveInclude = ejs.resolveInclude;

export interface EJSMiddlewareSettings {
  locals?: any;
  compileDebug?: boolean;
  writeResp?: boolean;
  _with?: boolean;
  outputFunctionName?: string;
  /** View root directory */
  root?: string;
  /** Global layout file, default is layout, set false to disable layout. */
  layout?: string | false;
  /** Filename extension for the views. Defaults to html. */
  viewExt?: string;
  /** Cache compiled templates */
  cache?: boolean;
  /** Log debug messages. */
  debug?: boolean;
  /** Character to use with angle brackets for open / close (default %). */
  delimiter?: string;
  /** View output type */
  type?: string | ((template: string) => string);
}

const defaultSettings: Omit<EJSMiddlewareSettings, 'root'> = {
  cache: true,
  layout: false,
  viewExt: 'ejs',
  locals: {},
  compileDebug: false,
  debug: false,
  writeResp: true,
};

const configureEJSMiddleware = (
  app: Application,
  settings: EJSMiddlewareSettings = defaultSettings,
) => {
  if (app.context.render) {
    return;
  }

  const cache = new Map<
    string,
    {
      filename: string;
      render: AsyncTemplateFunction;
    }
  >();

  settings = {
    ...defaultSettings,
    ...settings,
  };

  // override `ejs` node_module `resolveInclude` function
  ejs.resolveInclude = function (
    name: string,
    filename: string,
    isDir?: boolean,
  ) {
    if (!path.extname(name)) {
      name += settings.viewExt;
    }

    return parentResolveInclude(name, filename, isDir);
  };

  const getEJSTemplate = async (
    pathOrContent: string,
    options: any,
  ): Promise<{
    filename: string;
    content: string;
  }> => {
    // try to get from cache
    if (settings.cache && cache.has(pathOrContent)) {
      const { filename, render } = await cache.get(pathOrContent)!;

      return {
        filename,
        content: await render.call(options.scope, options),
      };
    }

    // If no root is specified, we assume it is an EJS string
    if (!settings.root) {
      return {
        filename: '<anonymous>',
        content: pathOrContent,
      };
    }

    try {
      const filename = path.join(
        settings.root,
        `${pathOrContent}.${settings.viewExt}`,
      );
      const content = await fs.readFile(filename, 'utf8');

      return {
        filename,
        content,
      };
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENAMETOOLONG') {
        throw error;
      }

      return {
        filename: '<anonymous>',
        content: pathOrContent,
      };
    }
  };

  /**
   * generate html with view name and options
   * @param {String} view
   * @param {Object} options
   * @return {String} html
   */
  async function render(view: string, options: any) {
    const { filename, content } = await getEJSTemplate(view, options);

    const render = ejs.compile(content, {
      filename,
      _with: settings._with,
      compileDebug: settings.debug && settings.compileDebug,
      debug: settings.debug,
      delimiter: settings.delimiter,
      cache: settings.cache,
      outputFunctionName: settings.outputFunctionName,
      async: true,
    });

    if (settings.cache) {
      cache.set(view, { filename, render });
    }

    return render.call(options.scope, options);
  }

  app.context.render = async function (view: string, _context: any) {
    const ctx = this;

    const context = {
      ...ctx.state,
      ..._context,
    };

    let html = await render(view, context);

    const layout = context.layout || settings.layout;

    if (layout) {
      // if using layout
      context.body = html;
      html = await render(layout, context);
    }

    const writeResp =
      context.writeResp === false
        ? false
        : context.writeResp || settings.writeResp;

    if (writeResp) {
      // normal operation
      ctx.type =
        typeof settings.type === 'function'
          ? settings.type(view)
          : settings.type || 'html';
      ctx.body = html;
    } else {
      // only return the html
      return html;
    }
  };
};

export default configureEJSMiddleware;
