// Decides whether the version in package.json still has to be published, and under which
// dist-tag. Run by the Publish workflow on every push to master; prints GitHub Actions
// outputs when GITHUB_OUTPUT is set and a human-readable line otherwise.
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

const parse = (version) => {
    const match = SEMVER.exec(version);
    if (!match) {
        throw new Error(`"${version}" is not a semver version`);
    }
    return {
        numbers: match.slice(1, 4).map(Number),
        prerelease: match[4] ? match[4].split(".") : [],
    };
};

const compareIdentifiers = (a, b) => {
    const numeric = /^\d+$/.test(a) && /^\d+$/.test(b);
    if (numeric) return Number(a) - Number(b);
    return a < b ? -1 : a > b ? 1 : 0;
};

/** Semver precedence: negative when `a` sorts before `b`. */
export const compare = (a, b) => {
    const left = parse(a);
    const right = parse(b);
    for (let i = 0; i < 3; i += 1) {
        if (left.numbers[i] !== right.numbers[i]) {
            return left.numbers[i] - right.numbers[i];
        }
    }
    // a release outranks its own prereleases
    if (left.prerelease.length === 0 || right.prerelease.length === 0) {
        return right.prerelease.length - left.prerelease.length;
    }
    const length = Math.max(left.prerelease.length, right.prerelease.length);
    for (let i = 0; i < length; i += 1) {
        if (left.prerelease[i] === undefined) return -1;
        if (right.prerelease[i] === undefined) return 1;
        const order = compareIdentifiers(
            left.prerelease[i],
            right.prerelease[i],
        );
        if (order !== 0) return order;
    }
    return 0;
};

/**
 * @param {{ version: string, published: string[], latest: string | null }} registry
 * @returns {{ publish: boolean, tag: "latest" | "next", reason: string }}
 */
export const decide = ({ version, published, latest }) => {
    if (published.includes(version)) {
        return { publish: false, tag: "latest", reason: "already on npm" };
    }
    if (parse(version).prerelease.length > 0) {
        // a prerelease never moves `latest`
        return { publish: true, tag: "next", reason: "prerelease" };
    }
    if (latest !== null && compare(version, latest) <= 0) {
        // publishing anything at or below `latest` would retag it; a backport is a manual publish
        throw new Error(
            `${version} is not newer than the published latest ${latest}; refusing to move the tag backwards`,
        );
    }
    return { publish: true, tag: "latest", reason: "new release" };
};

const view = (name, field) => {
    const output = execFileSync("npm", ["view", name, field, "--json"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    return output.trim() ? JSON.parse(output) : null;
};

const main = () => {
    const { name, version } = JSON.parse(readFileSync("package.json", "utf8"));
    // a single published version comes back as a bare string, not a one-element array
    const published = [view(name, "versions") ?? []].flat();
    const latest = view(name, "dist-tags.latest");

    const { publish, tag, reason } = decide({ version, published, latest });
    const lines = [`version=${version}`, `publish=${publish}`, `tag=${tag}`];

    console.log(
        `${name}@${version}: ${reason} (latest on npm: ${latest ?? "none"})`,
    );
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
    } else {
        console.log(lines.join("\n"));
    }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
