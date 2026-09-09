module.exports = {
    // the browser bundles follow `browserslist` in package.json; tests run on the current Node
    presets: ["@babel/preset-typescript", "@babel/preset-env"],
    env: {
        test: {
            presets: [["@babel/preset-env", { targets: { node: "current" } }]],
        },
    },
};
