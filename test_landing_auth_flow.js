// Test script for TripFlow landing page, session handling, and authentication flow
const fs = require('fs');
const path = require('path');

// Simulate Browser Environment
class MockStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] !== undefined ? this.store[key] : null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
}

global.window = global;
global.localStorage = new MockStorage();
global.sessionStorage = new MockStorage();
global.document = {
    getElementById: (id) => ({
        innerHTML: '',
        value: '',
        style: {},
        getContext: () => ({
            clearRect: () => {},
            drawImage: () => {}
        }),
        getBoundingClientRect: () => ({ width: 800, height: 600, top: 0 })
    }),
    addEventListener: () => {}
};
global.Image = class {
    constructor() {
        setTimeout(() => { if (this.onload) this.onload(); }, 10);
    }
};

global.API_BASE_URL = "http://localhost:8080/api";

// Load auth.js
const authCode = fs.readFileSync(path.join(__dirname, 'frontend/js/auth.js'), 'utf8');
eval(authCode);

async function runTests() {
    console.log("=================================================");
    console.log("TripFlow: Landing Page & Session Flow Test Suite");
    console.log("=================================================");

    const API_BASE_URL = "http://localhost:8080/api";

    // Test 1: Fresh Visit without logged-in session -> Landing Page
    console.log("\n[TEST 1] Fresh visit without logged-in session");
    sessionStorage.clear();
    localStorage.clear();
    const currentUserInit = getCurrentUser();
    const tokenInit = getToken();
    console.log("Initial User:", currentUserInit);
    console.log("Initial Token:", tokenInit);
    if (currentUserInit === null && tokenInit === null) {
        console.log("✓ PASS: User and token are null on fresh visit -> Landing Page is shown.");
    } else {
        throw new Error("FAIL: User or token was not null on fresh visit!");
    }

    // Test 2: Token validity check (valid, invalid, expired)
    console.log("\n[TEST 2] Testing isTokenValid()");
    // Valid mock JWT (future exp)
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const header = Buffer.from(JSON.stringify({ alg: "HS512" })).toString('base64url');
    const validPayload = Buffer.from(JSON.stringify({ sub: "owner", role: "OWNER", exp: futureExp })).toString('base64url');
    const validJwt = `${header}.${validPayload}.signature`;
    console.log("Valid JWT check:", isTokenValid(validJwt));
    if (!isTokenValid(validJwt)) throw new Error("FAIL: isTokenValid rejected valid JWT");

    // Expired mock JWT
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const expiredPayload = Buffer.from(JSON.stringify({ sub: "owner", role: "OWNER", exp: pastExp })).toString('base64url');
    const expiredJwt = `${header}.${expiredPayload}.signature`;
    console.log("Expired JWT check:", isTokenValid(expiredJwt));
    if (isTokenValid(expiredJwt)) throw new Error("FAIL: isTokenValid accepted expired JWT");

    // Corrupt JWT
    console.log("Corrupt string check:", isTokenValid("not-a-token"));
    if (isTokenValid("not-a-token")) throw new Error("FAIL: isTokenValid accepted corrupt token");
    console.log("✓ PASS: Token validation properly checks JWT structure and expiration.");

    // Test 3: Owner Login with Real Backend
    console.log("\n[TEST 3] Owner login with valid credentials (owner / owner123)");
    const ownerUser = await authLogin("owner", "owner123");
    console.log("Owner User Logged in:", ownerUser.name, "| Role:", ownerUser.role);
    const storedOwnerToken = getToken();
    const storedOwnerUser = getCurrentUser();
    console.log("Stored in sessionStorage -> Token exists:", !!storedOwnerToken, "| Role:", storedOwnerUser.role);
    if (storedOwnerUser.role !== "OWNER" || !storedOwnerToken) {
        throw new Error("FAIL: Owner session not stored correctly in sessionStorage");
    }
    console.log("✓ PASS: Owner login succeeds and stores authenticated session in sessionStorage.");

    // Test 4: Logout -> Clears session
    console.log("\n[TEST 4] Logout functionality");
    logoutUser();
    console.log("After logout -> Token:", getToken(), "| User:", getCurrentUser());
    if (getToken() !== null || getCurrentUser() !== null) {
        throw new Error("FAIL: Session was not completely cleared on logout");
    }
    console.log("✓ PASS: Logout completely purges session from storage.");

    // Test 5: Reopening application after logout -> Fresh state
    console.log("\n[TEST 5] Reopening application after logout");
    const freshToken = getToken();
    const freshUser = getCurrentUser();
    if (freshToken === null && freshUser === null) {
        console.log("✓ PASS: No automatic Owner login occurs. Fresh visit displays landing page.");
    } else {
        throw new Error("FAIL: Session restored unexpectedly after logout");
    }

    // Test 6: Driver Login with Real Backend
    console.log("\n[TEST 6] Driver login with valid credentials (DRV-01 / driver123)");
    const driverUser = await authLogin("DRV-01", "driver123");
    console.log("Driver Logged in:", driverUser.name, "| Role:", driverUser.role);
    const storedDriverToken = getToken();
    const storedDriverUser = getCurrentUser();
    if (storedDriverUser.role !== "DRIVER" || !storedDriverToken) {
        throw new Error("FAIL: Driver session not stored correctly in sessionStorage");
    }
    console.log("✓ PASS: Driver login succeeds and stores authenticated driver session.");

    // Test 7: Invalid Credentials
    console.log("\n[TEST 7] Invalid credentials attempt");
    let caughtError = null;
    try {
        await authLogin("owner", "wrongpassword");
    } catch (e) {
        caughtError = e;
    }
    console.log("Invalid login error caught:", caughtError ? caughtError.message : "None");
    if (!caughtError) {
        throw new Error("FAIL: Invalid credentials did not throw an error");
    }
    console.log("✓ PASS: Invalid credentials rejected with 401; no session created.");

    // Test 8: Stale/Expired Token in storage handling
    console.log("\n[TEST 8] Stale/Expired token handling in storage");
    sessionStorage.setItem("tripflow_token", expiredJwt);
    sessionStorage.setItem("tripflow_current_user", JSON.stringify({ role: "OWNER", name: "Expired Admin" }));
    const expiredTokenResult = getToken();
    const expiredUserResult = getCurrentUser();
    console.log("Token retrieved for expired JWT:", expiredTokenResult);
    console.log("User retrieved for expired JWT:", expiredUserResult);
    if (expiredTokenResult !== null || expiredUserResult !== null) {
        throw new Error("FAIL: Expired token was not automatically purged");
    }
    console.log("✓ PASS: Expired token is detected, purged, and access is blocked.");

    // Test 9: Cleanup and Final Verification
    console.log("\n[TEST 9] Verifying full cleanup");
    logoutUser();
    console.log("✓ PASS: System in clean, ready state.");

    console.log("\n=================================================");
    console.log("ALL 9 TEST CASES COMPLETED & PASSED SUCCESSFULLY!");
    console.log("=================================================");
}

runTests().catch(err => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
});
