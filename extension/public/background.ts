import {
  initContentScriptMessageListener,
  initExtensionMessageListener,
  initInstalledListener,
} from "background/index";

import { store } from "background/store";

initContentScriptMessageListener();
initExtensionMessageListener(store);
initInstalledListener();
