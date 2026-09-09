# v3.0.0

## New features
- Added multi-network support. Every wallet-facing function takes an optional `network`;
  omitting it means Stellar, permanently, so existing integrations are unaffected
- Added `getConnectedWallet`, which returns the address together with the network it is on
- Added `getSupportedNetworks` and `supportsNetwork`, so a page can ask an extension what it
  can do instead of assuming
- Added the `NETWORK` enum and the `NetworkId`, `SignType`, `NetworkDescriptor`,
  `SupportedNetwork`, `NetworkOptions` and `ConnectedWallet` types
- Added distinct error strings for network and payload failures, so integrators can branch
  instead of parsing `Sign failed`
- Added the `@lobstrco/signer-extension-api/protocol` entry point: the message names, API
  version, error strings and request/response types the SDK shares with the extension

## Breaking changes
- Rejections are `Error` objects; 2.x rejected with the bare string. The strings themselves
  are unchanged — compare `error.message`
- The package now declares an `exports` map. Deep paths such as
  `@lobstrco/signer-extension-api/build/index.min.js` no longer resolve — import the package
  itself. No existing call changes meaning

## Build improvements
- Ships separate ESM, CommonJS and UMD builds. Named imports now work at runtime in native
  ESM, where previously they existed only in the type definitions
- The publication guard type-checks the packed tarball from outside the repo and runs the
  installed package, so the types and the runtime cannot drift apart
- The SDK lives in its own repository, https://github.com/Lobstrco/lobstr-browser-extension,
  and the published declarations now carry their doc comments

## Documentation
- Documented the network API, the published module formats, the protocol entry point and
  every dApp-visible error string
- Corrected the browser global: it is `window.lobstrExtensionApi`

# v2.1.0

- Changed the package license to Apache-2.0

# v2.0.0

## New features
- Added `signMessage` function for signing arbitrary messages with the LOBSTR extension; returns the signed message together with the signer address
- Unified the signing protocol between the API and the extension, with API versioning for compatibility with future extension updates

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