import { spawn } from "node:child_process";

const port = String(process.env.SMOKE_PORT || 4010);
const host = "127.0.0.1";
const url = `http://${host}:${port}/login`;

const server = spawn(process.execPath, ["server.js"], {
  cwd: "azure-package",
  env: {
    ...process.env,
    HOSTNAME: host,
    NODE_ENV: "production",
    PORT: port,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let response;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      response = await fetch(url, { redirect: "manual" });
      break;
    } catch {
      await wait(250);
    }
  }

  if (!response || response.status !== 200) {
    throw new Error(`Standalone smoke test failed for ${url}`);
  }

  console.log(`Standalone smoke test passed: ${url}`);
} finally {
  server.kill();
  await wait(250);
}

server.on("exit", (code) => {
  if (code && code !== null) {
    console.error(output);
  }
});
