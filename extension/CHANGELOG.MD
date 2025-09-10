# v1.0.0

- Initial public release


# v1.0.1

- Fix domain position

# v1.0.2

- Change the extension name in the manifest

# v1.1.0

- Add a new home page with account balances.

# v1.2.0

- Code refactoring.
- Changed url for prices.

# v1.2.1

- Changed label for the total balance.
- Changed sorting algorithm.
- Allow to use the extension in all frames.

# v1.2.2
# v1.3.0

- Added nickname support

# v1.3.1

- Fixed connections remove on network error
- Added request cancellation on "connection add" screen exit

# v1.4.0

## New features
- Added support for signing arbitrary messages (not just transactions)
- Introduced unified signing interface that handles both transactions and messages

## API improvements
- Updated message signing API to return both signed data and signer address
- Added API versioning support (V1, V2) for better backward compatibility
- Enhanced type definitions for signing operations

## Code refactoring
- Refactored signing logic to support both transaction and message signing
- Unified external and internal message listeners for signing operations
- Improved error handling and user feedback for signing operations
- Removed deprecated SendTransaction component in favor of unified SignModal

## Breaking changes
- Removed separate transaction signing endpoints in favor of unified signing interface

# v1.3.2
- BREAKING: Completely removed Redux store and session management infrastructure. Updated message listeners to directly handle account operations without Redux dependencies
- Refactor: Simplified session state management by removing unused properties and selectors