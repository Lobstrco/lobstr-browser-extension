import { delay } from "../delay";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("delay", () => {
    it("resolves once the time has passed", async () => {
        const settled = jest.fn();
        const promise = delay(5000).then(settled);

        jest.advanceTimersByTime(4999);
        await Promise.resolve();
        expect(settled).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await promise;
        expect(settled).toHaveBeenCalledTimes(1);
    });

    it("resolves at once when the signal is already aborted", async () => {
        const controller = new AbortController();
        controller.abort();

        await expect(delay(5000, controller.signal)).resolves.toBeUndefined();
    });

    it("resolves early when the signal aborts during the wait", async () => {
        const controller = new AbortController();
        const settled = jest.fn();
        const promise = delay(5000, controller.signal).then(settled);

        controller.abort();
        await promise;

        expect(settled).toHaveBeenCalledTimes(1);
        // no pending timer left behind
        expect(jest.getTimerCount()).toBe(0);
    });

    it("drops its abort listener once the time has passed", async () => {
        const controller = new AbortController();
        const removeListener = jest.spyOn(
            controller.signal,
            "removeEventListener",
        );

        const promise = delay(5000, controller.signal);
        jest.advanceTimersByTime(5000);
        await promise;

        expect(removeListener).toHaveBeenCalled();
    });

    it("works without a signal", async () => {
        const promise = delay(1000);
        jest.advanceTimersByTime(1000);

        await expect(promise).resolves.toBeUndefined();
    });
});
