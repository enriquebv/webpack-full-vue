// Babel
const babel = {
  test: /\.js$/,
  exclude: /node_modules/,
  loader: "babel-loader"
};

module.exports = {
  rules: [babel]
};
