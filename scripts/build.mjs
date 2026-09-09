// One bundle per module system the package publishes; `exports` in package.json names them.
// Only the root entry has a <script> build: a second one would fight over the one global.
import { execFileSync } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const index = "src/index.ts";
const protocol = "src/protocol/index.ts";

const shared = {
    bundle: true,
    target: "es2020",
    legalComments: "none",
    logLevel: "info",
};

await rm("build", { recursive: true, force: true });

await Promise.all([
    build({
        ...shared,
        entryPoints: [index],
        format: "esm",
        outfile: "build/index.mjs",
    }),
    // `platform: "node"` annotates the export names, so a Node ESM import of the CJS file sees them
    build({
        ...shared,
        entryPoints: [index],
        format: "cjs",
        platform: "node",
        outfile: "build/index.cjs",
    }),
    build({
        ...shared,
        entryPoints: [index],
        format: "iife",
        globalName: "lobstrExtensionApi",
        minify: true,
        outfile: "build/index.min.js",
    }),
    build({
        ...shared,
        entryPoints: [protocol],
        format: "esm",
        outfile: "build/protocol.mjs",
    }),
    build({
        ...shared,
        entryPoints: [protocol],
        format: "cjs",
        platform: "node",
        outfile: "build/protocol.cjs",
    }),
]);

execFileSync(
    process.execPath,
    [
        "node_modules/typescript/bin/tsc",
        "-p",
        "tsconfig.json",
        "--emitDeclarationOnly",
    ],
    { stdio: "inherit" },
);

// Under Node-style resolution a `.d.ts` in a package without `"type": "module"` reads as
// CommonJS, which types the default import as the whole namespace. The `import` condition
// therefore gets an ESM-flavoured twin of each entry declaration, with explicit extensions.
for (const entry of ["index", "protocol/index"]) {
    const declaration = await readFile(`build/${entry}.d.ts`, "utf8");
    await writeFile(
        `build/${entry}.d.mts`,
        declaration.replace(/(from "\.{1,2}\/[^"]+)"/g, '$1.js"'),
    );
}
