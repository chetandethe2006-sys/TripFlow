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

// Authenticate Driver with Backend
async function driverLogin(identifier, password = "") {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/driver-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                identifier: identifier,
                password: password || undefined
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Driver login failed");
        }

        const data = await response.json();
        if (data.token) {
            saveToken(data.token);
        }
        
        const user = {
            id: data.driverId || data.id,
            name: data.name,
            role: "DRIVER",
            license: data.license,
            phone: data.phone,
            availability: data.availability,
            completedTrips: data.completedTrips
        };
        saveUser(user);
        return user;
    } catch (error) {
        console.error("Driver login error:", error);
        throw error;
    }
}

// Authenticate Owner with Backend
async function ownerLogin(username = "owner", password = "password") {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Owner login failed");
        }

        const data = await response.json();
        if (data.token) {
            saveToken(data.token);
        }

        const user = {
            id: data.username || "OWNER",
            name: data.name || "Admin Owner",
            role: "OWNER"
        };
        saveUser(user);
        return user;
    } catch (error) {
        console.error("Owner login error:", error);
        throw error;
    }
}