module.exports = {
    projects: [
        {
            displayName: "unit",
            testEnvironment: "jsdom",
            testMatch: ["<rootDir>/src/**/__tests__/**/*.test.[jt]s"],
            moduleFileExtensions: ["js", "ts", "json"],
        },
        {
            // exercises the packed output the way a Node consumer meets it; run `npm run build` first
            displayName: "node",
            testEnvironment: "node",
            testMatch: ["<rootDir>/tests/**/*.test.js"],
            moduleNameMapper: {
                "^@lobstrco/signer-extension-api$": "<rootDir>/build/index.cjs",
                "^@lobstrco/signer-extension-api/protocol$":
                    "<rootDir>/build/protocol.cjs",
            },
            moduleFileExtensions: ["js", "cjs", "json"],
        },
    ],
};
