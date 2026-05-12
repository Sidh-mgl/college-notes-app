import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const packageDir = join(root, "azure-package");

await rm(packageDir, { recursive: true, force: true });
await mkdir(packageDir, { recursive: true });

await cp(standaloneDir, packageDir, { recursive: true, dereference: true });
await cp(join(root, "public"), join(packageDir, "public"), { recursive: true });
await cp(
  join(root, ".next", "static"),
  join(packageDir, ".next", "static"),
  { recursive: true }
);

console.log(`Azure standalone package ready at ${packageDir}`);
