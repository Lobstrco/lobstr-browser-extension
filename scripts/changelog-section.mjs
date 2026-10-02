// Prints the CHANGELOG.MD section of one version: the release notes for the GitHub release.
// Fails when the section is missing, so a version cannot ship without its notes.
import { readFileSync } from "node:fs";

const version =
    process.argv[2] ?? JSON.parse(readFileSync("package.json", "utf8")).version;
const lines = readFileSync("CHANGELOG.MD", "utf8").split("\n");

const start = lines.findIndex((line) => line.trim() === `# v${version}`);
if (start < 0) {
    console.error(`CHANGELOG.MD has no "# v${version}" section`);
    process.exit(1);
}
const end = lines.findIndex((line, i) => i > start && /^# v/.test(line));
const section = lines
    .slice(start + 1, end < 0 ? lines.length : end)
    .join("\n")
    .trim();
if (!section) {
    console.error(`the "# v${version}" section of CHANGELOG.MD is empty`);
    process.exit(1);
}
process.stdout.write(section + "\n");
