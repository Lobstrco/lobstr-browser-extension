export function requestConnectionStatus(): Promise<unknown> {
    return Promise.resolve({ isConnected: true });
}