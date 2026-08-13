import { AsyncOperation, AsyncOperationsStore } from "../asyncOperations";

describe("AsyncOperation settlement", () => {
    it("runs settle hooks once on resolve", async () => {
        const operation = new AsyncOperation<string>();
        const hook = jest.fn();
        operation.onSettled(hook);

        operation.resolve("done");

        await expect(operation.promise).resolves.toBe("done");
        expect(hook).toHaveBeenCalledTimes(1);
    });

    it("runs settle hooks once on reject", async () => {
        const operation = new AsyncOperation<string>();
        const hook = jest.fn();
        operation.onSettled(hook);

        operation.reject("nope");

        await expect(operation.promise).rejects.toBe("nope");
        expect(hook).toHaveBeenCalledTimes(1);
    });

    it("ignores a second settle and does not re-run hooks", async () => {
        // models the normal flow: the popup settles the operation, then closing
        // the window fires onRemoved and settles it again
        const operation = new AsyncOperation<string>();
        const hook = jest.fn();
        operation.onSettled(hook);

        operation.resolve("first");
        operation.reject("late close");
        operation.resolve("later still");

        await expect(operation.promise).resolves.toBe("first");
        expect(hook).toHaveBeenCalledTimes(1);
    });

    it("does not recurse when a hook settles the operation again", async () => {
        const operation = new AsyncOperation<string>();
        const hook = jest.fn(() => operation.reject("from inside the hook"));
        operation.onSettled(hook);

        operation.resolve("done");

        await expect(operation.promise).resolves.toBe("done");
        expect(hook).toHaveBeenCalledTimes(1);
    });

    it("fires a hook registered after settlement", () => {
        const operation = new AsyncOperation<string>();
        operation.resolve("done");

        const hook = jest.fn();
        operation.onSettled(hook);

        expect(hook).toHaveBeenCalledTimes(1);
    });

    it("keeps settling when a hook throws", async () => {
        const operation = new AsyncOperation<string>();
        const survivor = jest.fn();
        operation.onSettled(() => {
            throw new Error("hook blew up");
        });
        operation.onSettled(survivor);

        operation.resolve("done");

        await expect(operation.promise).resolves.toBe("done");
        expect(survivor).toHaveBeenCalledTimes(1);
    });

    it("aborts its signal when it resolves", () => {
        // this is what stops the status polling once a request is over
        const operation = new AsyncOperation<string>();
        expect(operation.signal.aborted).toBe(false);

        operation.resolve("done");

        expect(operation.signal.aborted).toBe(true);
    });

    it("aborts its signal when it rejects", () => {
        const operation = new AsyncOperation<string>();
        operation.promise.catch(() => undefined);

        operation.reject("nope");

        expect(operation.signal.aborted).toBe(true);
    });

    it("still runs onResolve callbacks", async () => {
        const operation = new AsyncOperation<string>();
        const onResolve = jest.fn();
        operation.onResolve(onResolve);

        operation.resolve("done");

        await operation.promise;
        expect(onResolve).toHaveBeenCalledWith("done");
    });
});

describe("AsyncOperationsStore", () => {
    it("drops the operation from the store on any terminal path", () => {
        const resolved = AsyncOperationsStore.create<string, null>();
        const rejected = AsyncOperationsStore.create<string, null>();
        expect(AsyncOperationsStore.get(resolved.id)).toBe(resolved);
        expect(AsyncOperationsStore.get(rejected.id)).toBe(rejected);

        resolved.resolve("done");
        rejected.reject("nope");
        rejected.promise.catch(() => undefined);

        expect(AsyncOperationsStore.get(resolved.id)).toBeNull();
        expect(AsyncOperationsStore.get(rejected.id)).toBeNull();
    });

    it("hands out distinct ids", () => {
        const first = AsyncOperationsStore.create<string, null>();
        const second = AsyncOperationsStore.create<string, null>();

        expect(first.id).not.toBe(second.id);
        first.resolve("a");
        second.resolve("b");
    });
});
