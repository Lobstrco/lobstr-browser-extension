# v1.0.0

## New features
- Added `signMessage` function for signing arbitrary messages with the LOBSTR extension

## Build improvements
- Disabled source maps generation for production builds to reduce bundle size
- Added automatic build directory cleanup before each build
- Improved TypeScript compilation configuration to handle dependency type issues
- Optimized npm package contents to exclude development files and include only necessary files

## Package optimization
- Added `.npmignore` to exclude development files from npm package
- Configured `files` field in package.json to explicitly include only required files
- Reduced package size by excluding source code, tests, and build configuration files
- Included essential documentation (README.md, CHANGELOG.MD) in npm package

# v1.0.0-beta.0

- Name change to @lobstrco/signer-extension-api