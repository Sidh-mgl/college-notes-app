const BASE_URL = "http://localhost:3000";

async function verify() {
  console.log("Starting verification...");
  
  // Test 1: Access protected API without token -> should 401
  let res = await fetch(`${BASE_URL}/api/admin/test`);
  if (res.status !== 401) {
    console.error(`Test 1 Failed: Expected 401, got ${res.status}`);
    process.exit(1);
  }
  console.log("✅ Test 1 Passed: Unauthorized API access blocked (401).");

  // Test 2: Access protected page without token -> should redirect
  res = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  if (res.status < 300 || res.status >= 400 || !res.headers.get("location")?.includes("/login")) {
    console.error(`Test 2 Failed: Expected Redirect to /login, got ${res.status} to ${res.headers.get("location")}`);
    process.exit(1);
  }
  console.log("✅ Test 2 Passed: Unauthorized Page access redirected to /login.");

  // Test 3: Bad credentials -> 401
  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@college.com", password: "wrong" })
  });
  if (res.status !== 401) {
    console.error(`Test 3 Failed: expected 401 for bad login, got ${res.status}`);
    process.exit(1);
  }
  console.log("✅ Test 3 Passed: Bad credentials rejected (401).");

  // Test 4: Good credentials -> 200 + Cookie
  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@college.com", password: "adminpassword123" })
  });
  if (res.status !== 200) {
    console.error(`Test 4 Failed: expected 200 for good login, got ${res.status}`);
    process.exit(1);
  }
  const cookies = res.headers.get("set-cookie");
  if (!cookies || !cookies.includes("admin_token")) {
    console.error(`Test 4 Failed: No admin_token cookie received.`);
    process.exit(1);
  }
  console.log("✅ Test 4 Passed: Successful login set cookie.");

  // Test 5: Use cookie to hit /api/auth/me
  // extract just the part before ;
  const tokenCookie = cookies.split(';')[0];
  res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      "Cookie": tokenCookie,
    }
  });
  if (res.status !== 200) {
    console.error(`Test 5 Failed: expected 200 for /api/auth/me with cookie, got ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  if (!data.authenticated || data.user.email !== "admin@college.com") {
    console.error(`Test 5 Failed: Invalid user data returned from /me`, data);
    process.exit(1);
  }
  console.log("✅ Test 5 Passed: JWT verified correctly and payload extracted.");

  console.log("ALL TESTS PASSED 🎉");
}

verify().catch(console.error);
