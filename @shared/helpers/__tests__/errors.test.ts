import { serialize, deserialize } from "v8";
import { MessageError, normalizeError } from "../errors";

const FALLBACK = "Fallback message";

// jsdom may not expose structuredClone; v8's serialiser is the same machinery
const overTheWire = (value: unknown): any =>
    typeof structuredClone === "function"
        ? structuredClone(value)
        : deserialize(serialize(value));

describe("MessageError wire format", () => {
    it("is not an Error subclass", () => {
        // a subclass loses `.error` in the clone and signTransaction() resolves undefined
        expect(new MessageError("x")).not.toBeInstanceOf(Error);
    });

    it("survives serialisation as { error: string }", () => {
        expect(overTheWire(new MessageError("User declined access"))).toEqual({
            error: "User declined access",
        });
    });

    it("survives the content-script spread", () => {
        // models redirectMessagesToBackground.ts
        const wire = overTheWire(new MessageError("User declined access"));
        const posted = { ...wire, source: "S", messagedId: 1 };
        // this is the field @shared/api/external.ts reads to decide to throw
        expect(posted.error).toBe("User declined access");
    });

    it("survives JSON serialisation too", () => {
        // Chrome's runtime.sendMessage takes the JSON path, Firefox structured clone
        expect(JSON.parse(JSON.stringify(new MessageError("x")))).toEqual({
            error: "x",
        });
    });
});

describe("normalizeError", () => {
    const cases: [string, unknown, string][] = [
        ["bare string", "User declined access", "User declined access"],
        ["trims whitespace", "  padded  ", "padded"],
        ["whitespace only -> fallback", "   ", FALLBACK],
        ["empty string -> fallback", "", FALLBACK],
        ["null -> fallback", null, FALLBACK],
        ["undefined -> fallback", undefined, FALLBACK],
        ["{ error: string }", { error: "polling aborted" }, "polling aborted"],
        ["{ error: '' } -> fallback", { error: "" }, FALLBACK],
        ["live MessageError", new MessageError("declined"), "declined"],
        ["nested { error: { error } }", { error: { error: "timeout" } }, "timeout"],
        ["plain object -> fallback", {}, FALLBACK],
        ["array -> fallback", [], FALLBACK],
        ["number -> fallback", 42, FALLBACK],
        ["false -> fallback", false, FALLBACK],
    ];

    it.each(cases)("%s", (_label, input, expected) => {
        expect(normalizeError(input, FALLBACK)).toBe(expected);
    });

    it("unwraps a serialised MessageError", () => {
        expect(
            normalizeError(overTheWire(new MessageError("declined")), FALLBACK),
        ).toBe("declined");
    });

    it("unwraps a chain of any depth", () => {
        expect(
            normalizeError(
                { error: { error: { error: { error: { error: "deep" } } } } },
                FALLBACK,
            ),
        ).toBe("deep");
    });

    it("never returns an empty string, even for an empty fallback", () => {
        // `if (error) throw error` and the Connect QR retrigger both hang off this
        expect(normalizeError(undefined, "").length).toBeGreaterThan(0);
        expect(normalizeError({}, "   ").length).toBeGreaterThan(0);
    });

    it("does not throw when the fallback is not a string", () => {
        // runs inside catch blocks — throwing here would lose the original error
        expect(() => normalizeError({}, undefined as any)).not.toThrow();
        expect(normalizeError({}, 42 as any).length).toBeGreaterThan(0);
    });
});

describe("native Errors never reach a dApp", () => {
    const httpError = Object.assign(new Error("500: Internal Server Error"), {
        data: { detail: "db row 12 missing for user 5" },
    });

    it("hides the status line", () => {
        expect(normalizeError(httpError, FALLBACK)).toBe(FALLBACK);
    });

    it("hides it through an { error } wrapper", () => {
        expect(normalizeError({ error: httpError }, FALLBACK)).toBe(FALLBACK);
    });

    it("hides an `error` property bolted onto an Error", () => {
        const e = Object.assign(new Error("500: Internal Server Error"), {
            error: "internal server text",
        });
        expect(normalizeError(e, FALLBACK)).toBe(FALLBACK);
    });
});

describe("cycles", () => {
    it("stops on a self-referential payload", () => {
        const cyclic: any = {};
        cyclic.error = cyclic;
        expect(normalizeError(cyclic, FALLBACK)).toBe(FALLBACK);
    });

    it("stops on a two-node cycle", () => {
        const a: any = {};
        const b: any = { error: a };
        a.error = b;
        expect(normalizeError(a, FALLBACK)).toBe(FALLBACK);
    });
});
