import fs from "fs";
import path from "path";

describe("the published network vocabulary", () => {
    it("imports nothing, so the protocol entry can re-export it without closing a cycle", () => {
        // a cycle resolves to undefined, and an unnamed network means Stellar forever
        const source = fs.readFileSync(
            path.join(__dirname, "..", "networks.ts"),
            "utf8",
        );

        expect(source).not.toMatch(/^\s*import\b/m);
        expect(source).not.toMatch(/\bfrom\s*["']/);
        expect(source).not.toMatch(/\bimport\s*\(/);
        expect(source).not.toMatch(/\brequire\s*\(/);
    });
});
