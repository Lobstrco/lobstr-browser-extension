const path = require("path");

// One bundle per module system the package publishes; `exports` in package.json names them.
// Only the root entry has a UMD build: a second <script> bundle would fight over the one global.
const entries = {
    index: path.resolve(__dirname, "./src/index.ts"),
    protocol: path.resolve(__dirname, "./src/protocol/index.ts"),
};

module.exports = {
    umd: {
        entry: { index: entries.index },
        output: {
            globalObject: "this",
            library: "lobstrExtensionApi",
            libraryTarget: "umd",
            filename: "[name].min.js",
        },
    },
    cjs: {
        entry: entries,
        output: {
            library: { type: "commonjs2" },
            filename: "[name].cjs",
        },
    },
    esm: {
        entry: entries,
        // without this the named exports exist only in the types, never at runtime
        experiments: { outputModule: true },
        output: {
            module: true,
            library: { type: "module" },
            filename: "[name].mjs",
        },
    },
};
