const jsdomTests = {
  rootDir: __dirname,
  roots: [
    "./",
    "./extension",
    "./@shared/api",
    "./@lobstrco/signer-extension-api",
  ],
  collectCoverageFrom: ["src/**/*.{ts,tsx,mjs}"],
  setupFiles: [
    "<rootDir>/config/jest/jest.polyfills.js",
    "<rootDir>/config/jest/setupTests.tsx",
    "<rootDir>/node_modules/jest-canvas-mock",
  ],
  setupFilesAfterEnv: [
    "<rootDir>/config/jest/extendJest.ts",
    "@testing-library/jest-dom",
  ],
  testEnvironmentOptions: {
    url: "http://localhost",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx|mjs)$": ["babel-jest"],
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/config/jest/__mocks__/fileMock.ts",
    "\\.(scss|css)$": "<rootDir>/config/jest/__mocks__/styleMock.ts",
  },
  moduleFileExtensions: ["js", "jsx", "json", "node", "mjs", "ts", "tsx"],
  moduleDirectories: ["node_modules", "<rootDir>/extension/src", "<rootDir>/."],
  testEnvironment: "jsdom",
  // `.claude/worktrees` holds full repo checkouts the haste map would see as duplicates
  modulePathIgnorePatterns: ["extension/e2e-tests", "<rootDir>/.claude/"],
};

module.exports = {
  projects: [
    {
      displayName: "jsdom",
      ...jsdomTests,
    },
    {
      displayName: "node",
      testMatch: ["<rootDir>/testNodeCompat.js"],
      // This project does not spread `jsdomTests`, so it needs its own copy.
      modulePathIgnorePatterns: ["<rootDir>/.claude/"],
    },
  ],
};
