const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ["./src/main.js"],
  output: {
    filename: "frontError.min.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: "head",
      filename:'index.html',
      template:'./index.html',
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"
      }
    ]
  },
  devServer: {
    port: 8080
  }
};

