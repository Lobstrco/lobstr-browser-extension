import browser from "webextension-polyfill";
import { PopupWindow } from "../popupWindow";
import { ROUTES } from "../../../popup/constants/routes";

jest.mock("webextension-polyfill", () => ({
    __esModule: true,
    default: {
        windows: {
            create: jest.fn(),
            getCurrent: jest.fn(),
            onRemoved: { addListener: jest.fn(), removeListener: jest.fn() },
            update: jest.fn(),
            remove: jest.fn(),
        },
    },
}));

const windows = browser.windows as jest.Mocked<typeof browser.windows> & {
    onRemoved: { addListener: jest.Mock; removeListener: jest.Mock };
    update: jest.Mock;
    remove: jest.Mock;
};

// lets the constructor's promise chain run to completion
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    jest.clearAllMocks();
    (global as any).chrome = {
        runtime: {
            getURL: (path: string) => `chrome-extension://test${path}`,
            getPlatformInfo: () => Promise.resolve({ os: "mac" }),
        },
    };
    windows.getCurrent.mockResolvedValue({ top: 0, left: 0, width: 1200 } as any);
    windows.create.mockResolvedValue({ id: 42 } as any);
});

describe("PopupWindow when the window cannot be opened", () => {
    it("notifies onUnableToOpen if windows.create rejects", async () => {
        windows.create.mockRejectedValue(new Error("no window for you"));
        const popup = new PopupWindow(ROUTES.signModal);
        const unableToOpen = jest.fn();
        popup.onUnableToOpen(unableToOpen);
        popup.window.catch(() => undefined);

        await flush();

        expect(unableToOpen).toHaveBeenCalledTimes(1);
    });

    it("notifies onUnableToOpen if the window settings cannot be read", async () => {
        windows.getCurrent.mockRejectedValue(new Error("no current window"));
        const popup = new PopupWindow(ROUTES.signModal);
        const unableToOpen = jest.fn();
        popup.onUnableToOpen(unableToOpen);
        popup.window.catch(() => undefined);

        await flush();

        expect(unableToOpen).toHaveBeenCalledTimes(1);
    });

    it("fires a callback registered after the failure", async () => {
        windows.create.mockRejectedValue(new Error("no window for you"));
        const popup = new PopupWindow(ROUTES.signModal);
        popup.window.catch(() => undefined);
        await flush();

        const unableToOpen = jest.fn();
        popup.onUnableToOpen(unableToOpen);

        expect(unableToOpen).toHaveBeenCalledTimes(1);
    });

    it("keeps `window` rejecting so its callers still see the failure", async () => {
        windows.create.mockRejectedValue(new Error("no window for you"));
        const popup = new PopupWindow(ROUTES.signModal);

        await expect(popup.window).rejects.toThrow("no window for you");
    });
});

describe("PopupWindow removal", () => {
    it("notifies onRemoved and drops its listener when the window closes", async () => {
        const popup = new PopupWindow(ROUTES.signModal);
        const onRemoved = jest.fn();
        popup.onRemoved(onRemoved);
        await flush();

        const listener = windows.onRemoved.addListener.mock.calls[0][0];
        listener(42);

        expect(onRemoved).toHaveBeenCalledTimes(1);
        expect(windows.onRemoved.removeListener).toHaveBeenCalledWith(listener);
    });

    it("ignores an unrelated window closing", async () => {
        const popup = new PopupWindow(ROUTES.signModal);
        const onRemoved = jest.fn();
        popup.onRemoved(onRemoved);
        await flush();

        windows.onRemoved.addListener.mock.calls[0][0](999);

        expect(onRemoved).not.toHaveBeenCalled();
        expect(windows.onRemoved.removeListener).not.toHaveBeenCalled();
    });

    it("does not report a failure to open when the window opens fine", async () => {
        const popup = new PopupWindow(ROUTES.signModal);
        const unableToOpen = jest.fn();
        popup.onUnableToOpen(unableToOpen);

        await flush();

        expect(unableToOpen).not.toHaveBeenCalled();
    });
});

describe("PopupWindow focus and close", () => {
    it("brings its own window forward", async () => {
        const popup = new PopupWindow(ROUTES.signModal);
        await flush();

        await popup.focus();

        expect(windows.update).toHaveBeenCalledWith(42, { focused: true });
    });

    it("closes its own window", async () => {
        const popup = new PopupWindow(ROUTES.signModal);
        await flush();

        await popup.close();

        expect(windows.remove).toHaveBeenCalledWith(42);
    });

    it("does not throw when the window is already gone", async () => {
        windows.remove.mockRejectedValue(new Error("no such window"));
        const popup = new PopupWindow(ROUTES.signModal);
        await flush();

        await expect(popup.close()).resolves.toBeUndefined();
    });

    it("does not throw when the window never opened", async () => {
        windows.create.mockRejectedValue(new Error("no window for you"));
        const popup = new PopupWindow(ROUTES.signModal);
        popup.window.catch(() => undefined);
        await flush();

        await expect(popup.focus()).resolves.toBeUndefined();
        expect(windows.update).not.toHaveBeenCalled();
    });
});
