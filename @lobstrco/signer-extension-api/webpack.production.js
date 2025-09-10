const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");

const prodConfig = {
    devtool: false,
};

module.exports = merge(commonConfig, prodConfig);
