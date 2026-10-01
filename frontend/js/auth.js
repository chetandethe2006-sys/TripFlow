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

    console.log("User logged out");

    window.location.reload();
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
    return getUserRole() === "DRIVER";
}