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

# v1.5.0

## New features
- Several signature requests from one page now work. The extension keeps a single prompt window and hands the requests to the wallet one at a time, because the LOBSTR app shows one request and drops it when another arrives
- The prompt says how many requests have been signed and how many are still waiting, once more than one is involved

## Bug fixes
- Sign requests now report why they failed. A polling timeout and a network error were both reported as "Sign failed" and could not be told apart
- A response with no payload from the background is no longer treated as success. Previously `signTransaction` could resolve with `undefined` instead of rejecting
- Login errors are stored as a message string rather than a serialised error object
- A sign request no longer hangs forever when the confirmation window fails to open. The handler meant to report this was unreachable, so the request was never answered
- A confirmation window can no longer act on an unrelated request. It carries no request id at all now, and the ids themselves no longer repeat after a background restart
- A request with nothing to sign is rejected straight away and no longer opens a confirmation window the user then has to dismiss. It used to be reported as if the user had declined
- A failure to record the wallet's last activity time no longer aborts the signature. Wallet ordering may be briefly out of date instead, and corrects itself on the next signature
- Two sign requests from the same page no longer cancel each other. Status polling was tracked per connection, so starting a second request aborted the first
- A dropped connection while waiting for the wallet no longer leaves the request hanging. A failed poll was never caught and nothing settled the request, and the one-hour limit could not be reached because it was only checked after a successful poll. Polling now survives about a minute of trouble before giving up
- Closing the confirmation prompt now stops the polling. It used to keep asking the server for up to an hour, so a signature confirmed on the phone afterwards was thrown away
- An error response whose body is not JSON keeps its status code. It used to be replaced by a parsing error, which hid the status from everything that inspects it

## Code refactoring
- Unified error handling: one normalizer turns any thrown value into a message, and every user-facing error string now lives in a single module
- Moved `MessageError` to `@shared` so the messaging wire format sits next to the code that reads it
- The content script no longer lets a response overwrite the fields used to route it back to the page
- `AsyncOperation` gained a single settlement hook that runs cleanup exactly once on every terminal path, replacing two hooks that extended the promise chain
- Removed error state that was written but never read
- Each confirmation window now drops its close listener once it closes, instead of leaving one behind for the lifetime of the background script
- Both polling loops are plain loops instead of functions rescheduling themselves, and share one `delay` helper. Requests are cancelled through the operation itself, so every way a request can end also stops its polling
- Failed requests are retried only when retrying can help; a rejected connection or a bad address now fails immediately instead of being retried for a quarter of a minute
- Removed a handler that only forwarded a call to another function
- Signing is started by the background as soon as a request arrives, rather than by the confirmation window once it opens. The window only reports progress, so it can be shared and nothing is sent to the wallet before there is a window to act on
- Closing the prompt, or failing to open one, turns down every request it was holding

## Build and tests
- Fixed the test suite, which failed to run because it referenced an API removed two versions earlier
- Excluded worktree checkouts from the Jest module map
- Added the first unit tests for error normalization, async operations, the confirmation window, operation ids, both sides of the signing flow, both polling loops, connection refresh and the HTTP error shape
- Added tests for the shared prompt and its queue, the signing driver and the confirmation window's own behaviour
- Closed the coverage gaps the tests were leaving: cancelling a request now provably stops its polling, both polling timeouts are pinned to the message they report, and refreshing a connection is checked for every outcome — a revoked wallet is dropped, an unreachable server never costs one
