/** Not in the entry point: every public module would then import its own importer. */
export const isBrowser = typeof window !== "undefined";
