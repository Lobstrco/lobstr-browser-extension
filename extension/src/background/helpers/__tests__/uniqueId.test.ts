import { getUniqueId } from "../uniqueId";

describe("getUniqueId", () => {
    it("returns a non-empty string", () => {
        const id = getUniqueId();
        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
    });

    it("does not repeat", () => {
        // a counter reset to 1 by a worker restart is exactly what this prevents
        const ids = new Set(Array.from({ length: 500 }, () => getUniqueId()));
        expect(ids.size).toBe(500);
    });

    it("does not start from a fixed value a restart could reproduce", () => {
        expect(getUniqueId()).not.toBe("1");
        expect(getUniqueId()).not.toBe(getUniqueId());
    });
});
