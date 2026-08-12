// jsdom exposes `crypto` without randomUUID, so tests need the fallback
const fallbackId = (): string =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Ids must not repeat after the service worker restarts: a popup outlives the
 * worker and carries its operation id, so a reused id would let it address an
 * unrelated operation.
 */
export function getUniqueId(): string {
    return typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : fallbackId();
}
