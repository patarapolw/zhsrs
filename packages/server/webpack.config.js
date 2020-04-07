const fs = require('fs')
const path = require('path')

const nodeExternals = require('webpack-node-externals')
const dotenv = require('dotenv')

dotenv.config()
const { scripts, devDependencies, ...pkg } = require('./package.json')
const outDir = process.env.OUT_DIR = '../../heroku'

fs.writeFileSync(path.resolve(outDir, 'package.json'), JSON.stringify(pkg))

module.exports = {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: false
  },
  entry: './src/index.ts',
  output: {
    filename: 'server.js',
    path: path.resolve(outDir)
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  target: 'node',
  externals: [
    nodeExternals()
  ]
}
