const path = require("path");

const BUILD_PATH = path.resolve(__dirname, "./build");

const config = {
    output: {
        path: BUILD_PATH,
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        // two entries share `networks.ts`; inline it into each bundle rather than emit a chunk `files` would drop
        splitChunks: false,
        runtimeChunk: false,
    },
    stats: {
        all: false,
        modules: true,
        errors: true,
        warnings: true,
        moduleTrace: true,
        errorDetails: true,
        assets: true,
        excludeAssets: [/\.d\.ts/],
        hash: true,
        timings: true,
    },
};

module.exports = config;
