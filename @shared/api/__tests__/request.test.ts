import { get } from "../helpers/request";

const mockFetch = jest.fn();

const response = (status: number, body: unknown, statusText = "failed") => ({
    status,
    statusText,
    json: () =>
        body instanceof Error ? Promise.reject(body) : Promise.resolve(body),
});

beforeEach(() => {
    jest.resetAllMocks();
    (global as any).fetch = mockFetch;
});

describe("request error shape", () => {
    it("attaches the status and the parsed body", async () => {
        mockFetch.mockResolvedValue(response(400, { detail: "bad key" }));

        await expect(get("https://example.com")).rejects.toMatchObject({
            message: "400: failed",
            response: { status: 400 },
            data: { detail: "bad key" },
        });
    });

    it("still carries the status when the body is not JSON", async () => {
        // a proxy returning an HTML error page used to replace the whole error
        // with a SyntaxError, which hides the status the retry policy reads
        mockFetch.mockResolvedValue(response(404, new SyntaxError("not json")));

        await expect(get("https://example.com")).rejects.toMatchObject({
            message: "404: failed",
            response: { status: 404 },
        });
    });

    it("returns the parsed body on success", async () => {
        mockFetch.mockResolvedValue(response(200, { id: "tx-1" }));

        await expect(get("https://example.com")).resolves.toEqual({
            id: "tx-1",
        });
    });

    it("returns null for an empty response", async () => {
        mockFetch.mockResolvedValue(response(204, null));

        await expect(get("https://example.com")).resolves.toBeNull();
    });
});
