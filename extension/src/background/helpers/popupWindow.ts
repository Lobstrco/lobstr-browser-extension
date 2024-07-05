import browser from "webextension-polyfill";
import { POPUP_HEIGHT, POPUP_OFFSET_RIGHT, POPUP_OFFSET_TOP, POPUP_WIDTH } from "../constants/dimensions";
import { ROUTES } from "../../popup/constants/routes";
import { encodeObject } from "../../helpers/urls";
import { Windows } from "webextension-polyfill/namespaces/windows";

export interface WINDOW_PARAMS {
    type: "popup";
    width: number;
    height: number;
    top: number;
    left: number;
}

export class PopupWindow {
    get window(): Promise<Windows.Window> {
        return this.$window;
    }

    private windowRemoved: boolean = false;
    private unableToOpen: boolean = false;
    private readonly $window: Promise<Windows.Window>;
    private readonly BASE_PATH: string = '/index.html#';
    private readonly onRemovedCallbacks: Set<() => void> = new Set();
    private readonly unableToOpenCallbacks: Set<() => void> = new Set();

    constructor(private readonly route: ROUTES, private readonly data?: unknown) {
        this.$window = this.openWindow();
        this.$window.then((window: Windows.Window) => {
            browser.windows.onRemoved.addListener((removed) => {
                if (window.id === removed) {
                    this.windowRemoved = true;
                    Array.from(this.onRemovedCallbacks).forEach(cb => cb());
                    this.onRemovedCallbacks.clear();
                }
            });
            // Is this possible??? Leave for compatibility
            if (!window) {
                this.unableToOpen = true;
                Array.from(this.unableToOpenCallbacks).forEach(cb => cb());
                this.unableToOpenCallbacks.clear();
            }
        });
    }

    onRemoved(callback: () => void): this {
        if (this.windowRemoved) {
            callback();
        } else {
            this.onRemovedCallbacks.add(callback);
        }
        return this;
    }

    onUnableToOpen(callback: () => void): this {
        if (this.unableToOpen) {
            callback();
        } else {
            this.unableToOpenCallbacks.add(callback);
        }
        return this;
    }

    private async openWindow(): Promise<Windows.Window> {
        const settings: WINDOW_PARAMS = await PopupWindow.getWindowSettings();
        const encodedData: string | null = this.data ? encodeObject(this.data) : null;
        const path: string = encodedData ?
            `${this.BASE_PATH}${this.route}?${encodedData}` :
            `${this.BASE_PATH}${this.route}`;
        const url: string = chrome.runtime.getURL(path);
        return browser.windows.create({ url, ...settings });
    }

    static async getWindowSettings(): Promise<WINDOW_PARAMS> {
        const currentWindow = await browser.windows.getCurrent();
        const platform = await chrome.runtime.getPlatformInfo();
        const frameSize = platform.os === "win" ? 40 : 32;

        return {
            type: "popup",
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT + frameSize,
            top: (currentWindow?.top || 0) + POPUP_OFFSET_TOP,
            left:
                (currentWindow?.width || 0) +
                (currentWindow?.left || 0) -
                POPUP_WIDTH -
                POPUP_OFFSET_RIGHT,
        };
    }
}