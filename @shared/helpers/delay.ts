/** Resolves after `ms`, or as soon as `signal` aborts — what an abort means is the caller's call. */
export const delay = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve) => {
        if (signal?.aborted) {
            resolve();
            return;
        }
        const done = () => {
            clearTimeout(timer);
            signal?.removeEventListener("abort", done);
            resolve();
        };
        const timer = setTimeout(done, ms);
        signal?.addEventListener("abort", done, { once: true });
    });
