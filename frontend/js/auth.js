// ============================================
// TripFlow - Authentication Module
// ============================================


// Save logged-in user
function saveUser(user) {
    localStorage.setItem(
        "tripflow_current_user",
        JSON.stringify(user)
    );
}


// Get logged-in user
function getCurrentUser() {
    const user = localStorage.getItem(
        "tripflow_current_user"
    );

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);

    } catch (error) {
        console.error("Invalid user data:", error);
        return null;
    }
}


// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}


// Get user role
function getUserRole() {
    const user = getCurrentUser();

    return user ? user.role : null;
}


// Login user
function loginUser(user) {
    saveUser(user);

    console.log("User logged in:", user);
}


// Logout user
function logoutUser() {
    localStorage.removeItem(
        "tripflow_current_user"
    );

    localStorage.removeItem(
        "tripflow_token"
    );

    localStorage.removeItem(
        "tf_user"
    );

    console.log("User logged out");

    if (typeof state !== 'undefined') {
        state.currentUser = null;
        state.showLogin = false;
        state.currentRoute = 'dashboard';
        if (typeof render === 'function') {
            render();
        }
    }
}


// Save authentication token
function saveToken(token) {
    localStorage.setItem(
        "tripflow_token",
        token
    );
}


// Get authentication token
function getToken() {
    return localStorage.getItem(
        "tripflow_token"
    );
}


// Remove authentication token
function removeToken() {
    localStorage.removeItem(
        "tripflow_token"
    );
}


// Check owner role
function isOwner() {
    return getUserRole() === "OWNER";
}


// Check driver role
function isDriver() {
    const role = getUserRole();
    return role === "DRIVER" || role === "driver";
}

// Unified Login with Backend (Owner or Driver)
async function authLogin(loginId, password) {
    if (!loginId || !loginId.trim() || !password || !password.trim()) {
        throw new Error("Login ID and Password are required");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginId: loginId.trim(),
                password: password
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Invalid Login ID or Password");
        }

        const data = await response.json();
        if (data.token) {
            saveToken(data.token);
        }

        const role = (data.role || (data.id === 'OWNER' ? 'OWNER' : 'DRIVER')).toUpperCase();
        const user = {
            id: data.id || data.driverId || loginId,
            name: data.name || (role === 'OWNER' ? 'Admin Owner' : 'Driver'),
            role: role,
            license: data.license || '',
            phone: data.phone || '',
            availability: data.availability || 'Available',
            completedTrips: data.completedTrips || 0
        };

        saveUser(user);
        return user;
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}

// Authenticate Driver with Backend (Legacy wrapper)
async function driverLogin(identifier, password = "driver123") {
    return authLogin(identifier, password);
}

// Authenticate Owner with Backend (Legacy wrapper)
async function ownerLogin(username = "owner", password = "owner123") {
    return authLogin(username, password);
}