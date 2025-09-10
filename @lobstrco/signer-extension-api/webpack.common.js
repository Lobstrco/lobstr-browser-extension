const path = require("path");
const webpack = require("webpack");
const { DEFAULT_STATS } = require("../../config/webpack");

const BUILD_PATH = path.resolve(__dirname, "./build");

const config = {
    entry: {
        index: path.resolve(__dirname, "./src/index.ts"),
    },
    devtool: "source-map",
    output: {
        globalObject: "this",
        library: "lobstrExtensionApi",
        libraryTarget: "umd",
        path: BUILD_PATH,
        filename: "[name].min.js",
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@shared": path.resolve(__dirname, "../../@shared"),
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: { node: "current" } }],
                            "@babel/preset-typescript"
                        ]
                    }
                }],
            },
        ],
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, "../../node_modules")],
    },
    plugins: [
        new webpack.DefinePlugin({
            DEV_SERVER: false,
        }),
        new webpack.NormalModuleReplacementPlugin(
            /webextension-polyfill/,
            path.resolve(
                __dirname,
                "../../config/shims/webextension-polyfill.ts",
            ),
        ),
    ],
    stats: DEFAULT_STATS,
};

module.exports = config;
