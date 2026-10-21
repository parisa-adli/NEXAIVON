// Restyle scope check (spec #3, Testing Decisions): fails when the branch
// changes any file in an area a Restyle must not touch.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const PROTECTED = [
  "client/src/services/",
  "client/src/hooks/",
  "client/src/context/",
  "client/src/middleware.js",
  "client/src/utils/",
  "client/src/common/",
  "client/src/app/(profile)/",
  "client/src/app/(admin)/",
  "client/src/components/",
  "server/",
];

// New Storefront presentational components live here, inside an otherwise
// protected folder.
const ALLOWED = ["client/src/components/ui/"];

export function findProtectedChanges(paths) {
  return paths.filter(
    (path) =>
      PROTECTED.some((prefix) => path.startsWith(prefix)) &&
      !ALLOWED.some((prefix) => path.startsWith(prefix))
  );
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findBase() {
  for (const ref of ["main", "origin/main"]) {
    try {
      return git("merge-base", "HEAD", ref)[0];
    } catch {
      // try the next ref
    }
  }
  throw new Error("check:scope: no main or origin/main branch to compare with");
}

// Committed, staged, unstaged and untracked changes since the branch left main.
// --no-renames lists both sides of a move, so moving a file out of a protected
// area still counts as changing it.
function listChangedFiles() {
  const base = findBase();
  const changed = git("diff", "--name-only", "--no-renames", base);
  const untracked = git("ls-files", "--others", "--exclude-standard");
  return [...new Set([...changed, ...untracked])].sort();
}

function main() {
  const changed = listChangedFiles();
  const violations = findProtectedChanges(changed);

  console.log(`check:scope: ${changed.length} file(s) changed compared with main`);
  if (violations.length === 0) {
    console.log("check:scope: passed, no protected area touched");
    return;
  }
  console.error("check:scope: failed, these files are in a protected area:");
  for (const path of violations) console.error(`  ${path}`);
  process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
