const BASE_URL = process.env.VERIFY_BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.VERIFY_ADMIN_EMAIL || "admin@college.com";
const ADMIN_PASSWORD = process.env.VERIFY_ADMIN_PASSWORD || "adminpassword123";

async function verify() {
  console.log("Starting verification...");

  let res = await fetch(`${BASE_URL}/api/admin/test`);
  if (res.status !== 401) {
    console.error(`Test 1 failed: expected 401, got ${res.status}`);
    process.exit(1);
  }
  console.log("Test 1 passed: unauthorized API access blocked.");

  res = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  if (res.status < 300 || res.status >= 400 || !res.headers.get("location")?.includes("/login")) {
    console.error(`Test 2 failed: expected redirect to /login, got ${res.status} to ${res.headers.get("location")}`);
    process.exit(1);
  }
  console.log("Test 2 passed: unauthorized page access redirected to /login.");

  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: "wrong-password" }),
  });
  if (res.status !== 401 && res.status !== 403) {
    console.error(`Test 3 failed: expected 401/403 for bad login, got ${res.status}`);
    process.exit(1);
  }
  console.log("Test 3 passed: bad credentials rejected.");

  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (res.status !== 200) {
    console.error(`Test 4 failed: expected 200 for good login, got ${res.status}`);
    process.exit(1);
  }

  const cookies = res.headers.get("set-cookie");
  if (!cookies || !cookies.includes("admin_token")) {
    console.error("Test 4 failed: no admin_token cookie received.");
    process.exit(1);
  }
  console.log("Test 4 passed: successful login set cookie.");

  const tokenCookie = cookies.split(";")[0];
  res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Cookie: tokenCookie,
    },
  });
  if (res.status !== 200) {
    console.error(`Test 5 failed: expected 200 for /api/auth/me with cookie, got ${res.status}`);
    process.exit(1);
  }

  const data = await res.json();
  if (!data.authenticated || data.user.email !== ADMIN_EMAIL) {
    console.error("Test 5 failed: invalid user data returned from /me", data);
    process.exit(1);
  }
  console.log("Test 5 passed: JWT verified correctly.");

  console.log("All verification tests passed.");
}

verify().catch((error) => {
  console.error(error);
  process.exit(1);
});
