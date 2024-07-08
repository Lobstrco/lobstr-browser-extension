import punycode from "punycode";
import browser from "webextension-polyfill";

export interface Params {
  tab?: browser.Tabs.Tab;
  url: string;
  connectionKey?: string;
}

export const encodeObject = (obj: {}) => btoa(JSON.stringify(obj));
export const decodeString = (str: string) => atob(str);

export const newTabHref = (path = "", queryParams = "") =>
  `index.html#${path}${queryParams ? "?" : ""}${queryParams}`;

export const removeQueryParam = (url = "") => url.replace(/\?(.*)/, "");

export const parsedSearchParam = <T = Params>(param: string): T => {
  const decodedSearchParam = decodeString(param.replace("?", ""));
  return decodedSearchParam ? JSON.parse(decodedSearchParam) : {};
};

export const getUrlHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

export const getUrlDomain = (url: string) => {
  try {
    const u = new URL(url);
    const split = u.hostname.split(".");
    if (split.length > 2) {
      return `${split[split.length - 2]}.${split[split.length - 1]}`;
    }
    return u.hostname;
  } catch {
    return "";
  }
};

export const getPunycodedDomain = (url: string) => punycode.toASCII(url);
