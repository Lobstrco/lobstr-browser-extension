import { getUniqueId } from "./uniqueId";

const runHook = (hook: () => void): void => {
    try {
        hook();
    } catch (e) {
        console.error(e);
    }
};

class AsyncOperationsStoreSingleton {
    private store: Map<string, AsyncOperation<any, any>> = new Map();

    create<Result, Additional>(): AsyncOperation<Result, Additional> {
        const operation = new AsyncOperation<Result, Additional>();
        operation.onSettled(() => this.delete(operation.id));
        this.store.set(operation.id, operation);
        return operation;
    }

    get<Result = unknown, Additional = null>(id: string): AsyncOperation<Result, Additional> | null {
        return this.store.get(id) || null;
    }

    delete(id: string): void {
        this.store.delete(id);
    }
}

export const AsyncOperationsStore = new AsyncOperationsStoreSingleton();

export class AsyncOperation<Result = unknown, Additional = null> {
    get id(): string {
        return this._id;
    }

    get promise(): Promise<Result> {
        return this.operation;
    }

    /** Aborted as soon as the operation settles, whatever ended it. */
    get signal(): AbortSignal {
        return this.controller.signal;
    }

    private _id: string = getUniqueId();
    private settled: boolean = false;
    private additionalData: Additional | null = null;
    private operation: Promise<Result>;
    private resolveCallback!: (arg: Result) => void;
    private rejectCallback!: (error: unknown) => void;
    private readonly settleHooks: Set<() => void> = new Set();
    private readonly controller: AbortController = new AbortController();

    constructor() {
        this.operation = new Promise((resolve, reject) => {
            this.resolveCallback = resolve;
            this.rejectCallback = reject;
        });
    }

    resolve(data: Result): void {
        if (this.settled) {
            return;
        }
        this.settle();
        this.resolveCallback(data);
    }

    reject(reason: unknown): void {
        if (this.settled) {
            return;
        }
        this.settle();
        this.rejectCallback(reason);
    }

    /** Cleanup that runs exactly once on every terminal path; fires at once if already settled. */
    onSettled(callback: () => void): this {
        if (this.settled) {
            runHook(callback);
            return this;
        }
        this.settleHooks.add(callback);
        return this;
    }

    setAdditionalData(data: Additional): this {
        this.additionalData = data;
        return this;
    }

    getAdditionalData(): Additional | null {
        return this.additionalData;
    }

    syncEffect(callback: (operation: AsyncOperation<Result, Additional>) => void): this {
        callback(this);
        return this;
    }

    // extends the promise chain, so registration order matters — use onSettled for cleanup
    onResolve(callback: (result: Result) => void): this {
        this.operation = this.operation.then((result: Result) => {
            callback(result);
            return result;
        });
        return this;
    }

    private settle(): void {
        this.settled = true;
        this.controller.abort();
        const hooks = Array.from(this.settleHooks);
        this.settleHooks.clear();
        hooks.forEach(runHook);
    }
}
