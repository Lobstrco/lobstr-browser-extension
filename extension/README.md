# LOBSTR Web Extension

## Get Started

This project builds a web extension

### Build the extension and install it on your machine

We will compile the code for the extension and that load this local instance
into your browser.

Run

```
yarn build
```

To install on Chrome:

1. In Chrome, navigate to `chrome://extensions/`.

2. Toggle `Developer mode` to the ON position in the top right corner

3. You will now see a button in the top left titled `Load Unpacked`

4. Click `Load Unpacked` and it will open your file system.

5. Navigate to this folder and click the `build` folder. Hit `Select`. You
   should now see an icon for LOBSTR in Chrome.

To install on Firefox:

1. In Firefox, navigate to about:debugging#/runtime/this-firefox

2. Click `Load Temporary Add-On`

3. Navigate to this folder and open the `build` folder and find `manifest.json`.
   Hit `Select`. You should now see an icon for LOBSTR in Firefox

## Project Setup

This app has 3 main components that are named using extension nomenclature. All
of these are located in the `src/` folder:

1. The UI that appears when you click on the extension in your browser. This
   code also controls the fullscreen authentiction flow and any popups triggered
   by the extension. This is all controlled by one React app. In web extension
   parlance, this is called the `popup` and is therefore located in `src/popup`.

2. The "backend" service. We want to do things like account creation and store
   sensitive data, like public keys, in a secure place away from the `popup` and
   away from the `content script`. We want this service to be a standalone
   entity that these other 2 can make requests to and receive only what the
   backend sees fit. In web extension terms, this is known as the `background`
   script and is instantiated by `public/background`. The code is located in
   `src/background`.

   This script is run by the extension on browser starts and continues running,
   storing data and listening/responding to messages from `popup` and
   `content script`, and only terminates on browser close (or extension
   uninstall/reload). It is run in a headless browser, so it has access to all
   Web APIs. It also has accessible dev tools, which can be reached by going to
   `chrome://extensions/` or `about:debugging#/runtime/this-firefox` and
   clicking `Inspect`

3. The `content script` that allows external sites to send and receive messages
   to `background`. Using an event listener, it waits for an application to
   attempt to communicate using `@lobstr/extension-api`(under the hood,
   `window.postMessage`). Once it picks up a message and determines that this
   from `extension-api`, it sends the message onto `background`.

### Create a dev environment for the Popup and Playground to run in

Next we'll create a local environment. Here, you can access the `popup` in your
browser, so you can make edits with the benefit of hot reloads. This dev
environment will be able to make calls to the installed version of the
extension, so it has all the capabilites of the `popup` inside the extension.

_NOTE: This dev environment only works for the `popup`_

Changes to `background` and `content script` will still require a production
build using `yarn build`, followed by reloading the extension in Chrome.

1. Start a local dev server by running

```
yarn start
```

You should be able to access the Popup by going to `localhost:9000/`