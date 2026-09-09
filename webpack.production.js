const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const targets = require("./webpack.targets.js");

const prodConfig = {
    devtool: false,
};

module.exports = Object.values(targets).map((target) =>
    merge(commonConfig, prodConfig, target),
);
