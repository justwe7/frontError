const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ["./src/main.js"],
  output: {
    filename: "report.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: "head",
      filename:'index.html',//文件名
      template:'./index.html',//参照模板样式
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

