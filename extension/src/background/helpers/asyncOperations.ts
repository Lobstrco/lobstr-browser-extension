import { getUniqueId } from "./uniqueId";

class AsyncOperationsStoreSingleton {
    private store: Map<number, AsyncOperation<any, any>> = new Map();

    create<Result, Additional>(): AsyncOperation<Result, Additional> {
        const operation = new AsyncOperation<Result, Additional>();
        operation
            .onResolve(() => this.delete(operation.id))
            .onError(() => this.delete(operation.id));
        this.store.set(operation.id, operation);
        return operation;
    }

    get<Result = unknown, Additional = null>(id: number): AsyncOperation<Result, Additional> | null {
        return this.store.get(id) || null;
    }

    delete(id: number): void {
        this.store.delete(id);
    }
}

export const AsyncOperationsStore = new AsyncOperationsStoreSingleton();

export class AsyncOperation<Result = unknown, Additional = null> {
    get id(): number {
        return this._id;
    }

    get promise(): Promise<Result> {
        return this.operation;
    }

    private _id: number = getUniqueId();
    private additionalData: Additional | null = null;
    private operation: Promise<Result>;
    private resolveCallback!: (arg: Result) => void;
    private rejectCallback!: (error: unknown) => void;

    constructor() {
        this.operation = new Promise((resolve, reject) => {
            this.resolveCallback = resolve;
            this.rejectCallback = reject;
        });
    }

    resolve(data: Result): void {
        this.resolveCallback(data);
    }

    reject(reason: unknown): void {
        this.rejectCallback(reason);
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

    onResolve(callback: (result: Result) => void): this {
        this.operation = this.operation.then((result: Result) => {
            callback(result);
            return result;
        });
        return this;
    }

    onError(callback: (error: unknown) => void): this {
        this.operation = this.operation.catch((error: unknown) => {
            callback(error);
            return Promise.reject(error);
        });
        return this;
    }
}