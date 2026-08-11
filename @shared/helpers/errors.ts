// keep dependency-free: this is a candidate for the ~3 KB SDK bundle, which has no tree-shaking

/** Must NOT extend `Error`: clone drops own properties and the dApp then resolves `undefined`. */
export class MessageError {
    constructor(public readonly error: string) {}
}

/** Never returns an empty string: callers use truthiness to decide whether to throw. */
export const normalizeError = (value: unknown, fallback: string): string =>
    unwrap(value) || safeFallback(fallback);

/** Own property only — `in` would let an inherited key or getter drive the unwrap. */
const hasOwnError = (value: unknown): value is { error: unknown } =>
    typeof value === "object" &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, "error");

const unwrap = (value: unknown): string => {
    const seen = new Set<unknown>();
    let current = value;
    // a native Error ends the walk: its message and attached body must not reach a dApp
    while (!(current instanceof Error) && hasOwnError(current)) {
        if (seen.has(current)) return "";
        seen.add(current);
        current = current.error;
    }
    return typeof current === "string" ? current.trim() : "";
};

/** Called from inside `catch` blocks, so this must never throw. */
const safeFallback = (fallback: unknown): string =>
    (typeof fallback === "string" ? fallback.trim() : "") || "Unknown error";
