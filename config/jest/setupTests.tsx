// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { JSDOM } from "jsdom";
import React from "react";
import fetch from "isomorphic-unfetch";
import "jest-localstorage-mock";
import "jsdom-global";

// make a JSDOM thing so we can fuck with mount
const jsdom = new JSDOM("<!doctype html><html lang='en'><body></body></html>");
const { window } = jsdom;

global.fetch = fetch;
window.fetch = fetch;
// @ts-ignore
global.DEV_SERVER = true;
// @ts-ignore
global.DEV_EXTENSION = true;
// @ts-ignore
global.PRODUCTION = false;
// @ts-ignore
global.EXPERIMENTAL = false;

process.env.INDEXER_URL = "http://localhost:3002/api/v1";

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (element: React.ReactElement) => element,
}));
