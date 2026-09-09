import * as protocol from "@lobstrco/signer-extension-api/protocol";

// exact on purpose: an export added or dropped fails here until this list says so
const RUNTIME_NAMES = [
    "API_VERSION",
    "DEFAULT_NETWORK",
    "ERROR_MESSAGES",
    "EXTERNAL_MSG_REQUEST",
    "EXTERNAL_MSG_RESPONSE",
    "EXTERNAL_SERVICE_TYPES",
    "NETWORK",
    "networkOrLegacy",
];

describe("the protocol entry, as a Node consumer meets it", () => {
    test("exports exactly the vocabulary the extension imports", () => {
        const named = Object.keys(protocol)
            .filter((key) => key !== "default")
            .sort();
        expect(named).toEqual(RUNTIME_NAMES);
    });

    test("keeps every message type equal to its key", () => {
        // the content script matches on the keys, so a value that differs is silently dropped
        Object.entries(protocol.EXTERNAL_SERVICE_TYPES).forEach(
            ([key, value]) => {
                expect(value).toBe(key);
            },
        );
    });

    test("ships the fifteen dApp-visible error strings and the numbered versions", () => {
        expect(Object.keys(protocol.ERROR_MESSAGES)).toHaveLength(15);
        expect([
            protocol.API_VERSION.V1,
            protocol.API_VERSION.V2,
            protocol.API_VERSION.V3,
        ]).toEqual([0, 1, 2]);
        expect(protocol.networkOrLegacy(undefined)).toBe(
            protocol.NETWORK.stellar,
        );
    });
});
