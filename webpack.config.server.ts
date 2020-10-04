import { Configuration, BannerPlugin, DefinePlugin } from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import CopyPlugin from 'copy-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const baseSrcPath = path.resolve(__dirname, 'src');
const baseLibPath = path.resolve(__dirname, 'lib');

const config: Configuration = {
  target: 'node',
  mode: isDev ? 'development' : 'production',
  context: baseSrcPath,
  entry: path.resolve(baseSrcPath, 'index.ts'),
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  output: {
    filename: 'server.js',
    path: baseLibPath,
    pathinfo: false,
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
          }),
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
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
      entryOnly: true,
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(baseSrcPath, 'templates'),
          to: path.resolve(baseLibPath, 'templates'),
        },
        {
          from: path.resolve(baseSrcPath, 'fonts'),
          to: path.resolve(baseLibPath, 'fonts'),
        },
      ],
    }),
  ],
  externals: [
    nodeExternals({
      importType: ('commonjs2' as unknown) as 'commonjs',
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default config;
