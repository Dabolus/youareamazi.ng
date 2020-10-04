import { Configuration } from 'webpack';
import path from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { InjectManifest as InjectManifestPlugin } from 'workbox-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';
export const baseSrcPath = path.resolve(__dirname, 'src/apps');
export const baseLibPath = path.resolve(__dirname, 'lib/apps');

const createWebpackConfig = (
  app: string,
  templated: boolean,
): Configuration => {
  const baseAppSrcPath = path.resolve(baseSrcPath, app);
  const baseAppLibPath = path.resolve(baseLibPath, app);

  return {
    mode: isDev ? 'development' : 'production',
    context: baseAppSrcPath,
    entry: [path.resolve(baseAppSrcPath, 'index.ts')],
    resolve: {
      extensions: ['.scss', '.sass', '.css', '.ejs', '.html', '.ts', '.js'],
    },
    output: {
      filename: 'main.js',
      path: baseAppLibPath,
      pathinfo: false,
      publicPath: isDev ? `/${app}` : '/',
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
    devtool: isDev ? 'eval-source-map' : 'source-map',
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
            {
              loader: 'css-loader',
              options: {
                url: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'postcss-preset-env',
                    'autoprefixer',
                    [
                      'cssnano',
                      {
                        preset: [
                          'advanced',
                          {
                            autoprefixer: false,
                          },
                        ],
                      },
                    ],
                  ],
                },
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
        scriptLoading: 'defer',
        template: `html-loader!${path.resolve(
          baseAppSrcPath,
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
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(baseAppSrcPath, 'assets'),
            to: baseAppLibPath,
          },
        ],
      }),
      ...(isDev
        ? []
        : [
            new InjectManifestPlugin({
              swSrc: path.resolve(baseAppSrcPath, 'sw.ts'),
              swDest: './sw.js',
              exclude: [
                /images\/icons/,
                /\.LICENSE$/,
                /\.map$/,
                /(?:^|\/)\..+$/,
              ],
            }),
          ]),
    ],
  };
};

export default [
  createWebpackConfig('home', false),
  createWebpackConfig('motivation', true),
];
