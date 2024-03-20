# @lobstr/extension-api

This packages builds a wrapper around the messaging system used to interact with
the LOBSTR web extension. Client applications will be able to install this package
from npm and then integrate with LOBSTR using dev-friendly methods.

## Getting Started
To get started, you'll need both the LOBSTR extension and the API needed to integrate with it.

### Install the Freighter extension.
You'll want a local version of the extension to test with.

- Head over to the Chrome extension store and install LOBSTR into your browser.

### Install LOBSTR API
Now we need a way to communicate with the extension. To facilitate this, we create a Javascript library called **@lobstr/extension-api** that will let you send and receives messages from the extension.

#### For ES2023 applications
- Install the module using npm: ```npm install @lobstr/extension-api```

or

- Install the module using yarn: ```yarn add @lobstr/extension-api```

#### For browser-based applications
Install the packaged library via script tag using cdnjs, swapping in the desired version number for ```{version}```:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lobstr-extension-api/{version}/index.min.js"></script>
```

## Using LOBSTR in a web app
We now have an extension installed on our machine and a library to interact with it. This library will provide you methods to send and receive data from a user's extension in your website or application.

### Importing
First import the whole library in an ES2023 application

```javascript
import lobstrApi from "@lobstr/extension-api";
```

or import just the modules you require:

```javascript
import {
 isConnected,
 getPublicKey,
 signTransaction,
} from "@lobstr/extension-api";
```

Now let's dig into what functionality is available to you:

### isConnected

```isConnected() -> <Promise<boolean>>```

This function is useful for determining if a user in your application has LOBSTR installed.

```javascript
import { isConnected } from "@lobstr/extension-api";

if (await isConnected()) {
  alert("User has LOBSTR!");
}
```

### getPublicKey

```getPublicKey() -> <Promise<string>>```

If LOBSTR is connected, LOBSTR will simply return the public key. If either one of the above is not true, it will return an empty string.

```typescript
import { getPublicKey } from "@lobstr/extension-api";

const retrievePublicKey = async (): Promise<string> => {
  let publicKey = "";
  let error = "";

  try {
    publicKey = await getPublicKey();
  } catch (e) {
    error = e;
  }

  if (error) {
    return error;
  }

  return publicKey;
};
```

### signTransaction

```signTransaction(xdr: string) -> <Promise<string>>```

This function accepts a transaction XDR string, which it will decode, sign as the user, and then return the signed transaction to your application.

*NOTE:* The user must provide a valid transaction XDR string for the extension to properly sign.


```typescript
import { signTransaction } from "@lobstr/extension-api";

const userSignTransaction = async (xdr: string): Promise<string> => {
  let signedTransaction = "";
  let error = "";

  try {
    signedTransaction = await signTransaction(xdr);
  } catch (e) {
    error = e;
  }

  if (error) {
    return error;
  }

  return signedTransaction;
};
```

## Using LOBSTR in the browser
We now have an extension installed on our machine and a library to interact with it. This library will provide you methods to send and receive data from a user's extension in your website or application.

### Importing
First import the library in the ```<head>``` tag of your page.

- Install the packaged library via script tag using cdnjs, swapping in the desired version number for ```{version}```

```html
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lobstr-extension-api/{version}/index.min.js"></script>
</head>
```

This will expose a global variable called window.lobstrSignerExtension that will contain our library.

The call signatures will be exactly the same as the node version, but you will call the methods directly from window.lobstrSignerExtensionApi:

For example:

```javascript
if (await window.lobstrSignerExtensionApi.isConnected()) {
  alert("User has LOBSTR!");
}
```