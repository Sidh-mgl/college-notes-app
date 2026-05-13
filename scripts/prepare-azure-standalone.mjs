import { cp, mkdir, rm, writeFile } from "node:fs/promises";
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

await writeFile(
  join(packageDir, "web.config"),
  `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <match url="/*" />
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <iisnode node_env="production" />
  </system.webServer>
</configuration>
`
);

console.log(`Azure standalone package ready at ${packageDir}`);
