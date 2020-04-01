import { Configuration } from 'webpack';
import path from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const createWebpackConfig = (
  app: string,
  templated: boolean,
): Configuration => {
  const baseSrcPath = path.resolve(__dirname, 'src/apps', app);
  const baseDistPath = path.resolve(__dirname, 'dist/apps', app);

  return {
    mode: isDev ? 'development' : 'production',
    context: baseSrcPath,
    entry: [path.resolve(baseSrcPath, 'index.ts')],
    resolve: {
      extensions: ['.scss', '.sass', '.css', '.ejs', '.html', '.ts', '.js'],
    },
    output: {
      filename: 'main.js',
      path: baseDistPath,
      pathinfo: false,
      publicPath: `/${app}`,
    },
    optimization: isDev
      ? {
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        }
      : {
          minimizer: [
            new TerserPlugin({
              extractComments: 'all',
              terserOptions: {
                compress: {
                  drop_console: true, // eslint-disable-line @typescript-eslint/camelcase
                },
              },
            }),
            new OptimizeCssAssetsPlugin(),
          ],
        },
    ...(isDev && {
      devtool: 'eval-source-map',
    }),
    module: {
      rules: [
        {
          test: /\.[tj]s$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
        {
          test: /\.s?[ac]ss$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isDev,
              },
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('postcss-preset-env')(),
                  require('autoprefixer')(),
                  require('cssnano')({
                    preset: [
                      'advanced',
                      {
                        autoprefixer: false,
                      },
                    ],
                  }),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: ['node_modules'],
                },
              },
            },
          ],
        },
        {
          test: /\.ya?ml$/,
          exclude: /node_modules/,
          type: 'json', // Required by Webpack v4
          use: 'yaml-loader',
        },
      ],
    },
    plugins: [
      new HtmlPlugin({
        inject: 'head',
        template: `html-loader!${path.resolve(
          baseSrcPath,
          `index.${templated ? 'ejs' : 'html'}`,
        )}`,
        filename: `index.${templated ? 'ejs' : 'html'}`,
        ...(isDev
          ? {
              showErrors: true,
            }
          : {
              minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                sortAttributes: true,
                sortClassName: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true,
              },
            }),
      }),
      new MiniCssExtractPlugin({
        filename: 'main.css',
      }),
      new CopyPlugin([
        {
          from: path.resolve(baseSrcPath, 'assets'),
          to: baseDistPath,
        },
      ]),
    ],
  };
};

export default [
  createWebpackConfig('home', false),
  createWebpackConfig('motivation', true),
];
