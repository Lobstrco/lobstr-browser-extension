import { describe, expect, test } from "vitest";
import { compare, decide } from "../scripts/publish-gate.mjs";

describe("semver precedence", () => {
    test.each([
        ["3.0.0", "2.1.0", 1],
        ["2.1.0", "3.0.0", -1],
        ["3.0.0", "3.0.0", 0],
        ["3.0.0", "3.0.0-beta.1", 1],
        ["3.0.0-beta.1", "3.0.0-beta.2", -1],
        ["3.0.0-beta.10", "3.0.0-beta.9", 1],
        ["3.0.0-alpha", "3.0.0-beta", -1],
        ["3.0.0-beta", "3.0.0-beta.1", -1],
    ])("%s vs %s → %i", (a, b, sign) => {
        expect(Math.sign(compare(a, b))).toBe(sign);
    });

    test("rejects a version that is not semver", () => {
        expect(() => compare("3.0", "3.0.0")).toThrow("not a semver version");
    });
});

describe("the publish decision", () => {
    const published = ["1.0.0-beta.0", "2.0.0", "2.1.0"];

    test("publishes a new release to latest", () => {
        expect(
            decide({ version: "3.0.0", published, latest: "2.1.0" }),
        ).toMatchObject({
            publish: true,
            tag: "latest",
        });
    });

    test("skips a version that is already on npm", () => {
        expect(
            decide({ version: "2.1.0", published, latest: "2.1.0" }),
        ).toMatchObject({
            publish: false,
        });
    });

    test("sends a prerelease to next without touching latest", () => {
        expect(
            decide({ version: "3.1.0-beta.0", published, latest: "3.0.0" }),
        ).toMatchObject({ publish: true, tag: "next" });
    });

    test("refuses to move latest backwards", () => {
        // a 2.x backport after 3.0.0 would retag latest; that stays a manual publish
        expect(() =>
            decide({ version: "2.2.0", published, latest: "3.0.0" }),
        ).toThrow("refusing to move the tag backwards");
    });

    test("publishes the first version of a package nobody has published yet", () => {
        expect(
            decide({ version: "1.0.0", published: [], latest: null }),
        ).toMatchObject({
            publish: true,
            tag: "latest",
        });
    });
});
