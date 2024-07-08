import {
  initContentScriptMessageListener,
  initExtensionMessageListener,
  initInstalledListener,
} from "background/index";

initContentScriptMessageListener();
initExtensionMessageListener();
initInstalledListener();
