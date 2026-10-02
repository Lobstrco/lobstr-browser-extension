import { describe, expect, it } from "vitest";
import { NETWORK, networkOrLegacy } from "../networks";

const UNKNOWN = "bitcoin";

describe("reading a network off the wire", () => {
    it("fills in Stellar only when the field is absent", () => {
        // the permanent compatibility rule: every caller that predates the field
        expect(networkOrLegacy(undefined)).toBe(NETWORK.stellar);
    });

    it.each([[NETWORK.ripple], [UNKNOWN], [""]])(
        "leaves %j exactly as it arrived",
        (value) => {
            // a present value is the sender's, and rewriting it names the wrong chain
            expect(networkOrLegacy(value)).toBe(value);
        },
    );
});
