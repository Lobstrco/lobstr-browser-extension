import { createRequire } from "node:module";
import { describe, test } from "vitest";

// Node resolves the package's own name through its `exports` map, as a CommonJS consumer would
const publicInterface = createRequire(import.meta.url)(
    "@lobstrco/signer-extension-api",
);

describe.each(Object.keys(publicInterface.default))("%s", (fn) => {
    test("exits gracefully in node", async () => {
        // just call the function and make sure it doesn't throw
        // in node, all of them should exit gracefully before even checking args, so we can pass nothing
        await publicInterface[fn]();
    });
});
