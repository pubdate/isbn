const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.ts',
    'isbn-without-registration-groups': './src/isbn-without-registration-groups.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: { configFile: 'tsconfig.build.json' }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    library: {
      name: 'ISBN',
      type: 'umd',
      export: 'default'
    }
  }
}
