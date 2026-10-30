// ============================================
// TripFlow - API Configuration & Common API
// ============================================

// Resolves API Base URL:
// 1. window.TRIPFLOW_API_URL if set (e.g., in config.js or by deployment script)
// 2. Relative '/api' if hosted on Render or remote host without custom API URL
// 3. Defaults to 'http://localhost:8080/api' for local development
const API_BASE_URL = (function () {
    if (typeof window !== "undefined") {
        // 1. Localhost always defaults to local backend unless query override is given
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            const urlParams = new URLSearchParams(window.location.search);
            const queryApi = urlParams.get("api");
            return queryApi ? queryApi.replace(/\/$/, "") : "http://localhost:8080/api";
        }

        // 2. Explicit query parameter override (e.g. ?api=https://my-backend.onrender.com/api)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const queryApi = urlParams.get("api");
            if (queryApi) {
                localStorage.setItem("tripflow_api_url", queryApi);
                return queryApi.replace(/\/$/, "");
            }
        } catch (e) {}

        // 3. Stored localStorage URL
        const storedApi = localStorage.getItem("tripflow_api_url");
        if (storedApi) {
            return storedApi.replace(/\/$/, "");
        }

        // 4. Explicit window.TRIPFLOW_API_URL from config.js
        if (window.TRIPFLOW_API_URL && typeof window.TRIPFLOW_API_URL === "string" && window.TRIPFLOW_API_URL.trim() !== "") {
            return window.TRIPFLOW_API_URL.replace(/\/$/, "");
        }

        // 5. Default fallback for Render production
        return "https://tripflow-backend-cqrk.onrender.com/api";
    }
    return "http://localhost:8080/api";
})();

function getAuthHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    const token = typeof getToken === "function" ? getToken() : (sessionStorage.getItem("tripflow_token") || localStorage.getItem("tripflow_token"));
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

function handleUnauthorized() {
    console.warn("Unauthorized request, clearing session");
    if (typeof logoutUser === "function") {
        logoutUser();
    } else {
        sessionStorage.removeItem("tripflow_token");
        sessionStorage.removeItem("tripflow_current_user");
        localStorage.removeItem("tripflow_token");
        localStorage.removeItem("tripflow_current_user");
        localStorage.removeItem("tf_user");
        if (typeof state !== "undefined") {
            state.currentUser = null;
            state.showLogin = false;
            if (typeof render === "function") {
                render();
            }
        }
    }
}

// Generic GET request
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized (401)");
        }

        if (!response.ok) {
            throw new Error(`GET ${endpoint} failed with status ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("API GET Error:", error);
        throw error;
    }
}


// Generic POST request
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "POST",
                headers: getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(data)
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized (401)");
        }

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `POST ${endpoint} failed with status ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("API POST Error:", error);
        throw error;
    }
}


// Generic PUT request
async function apiPut(endpoint, data) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "PUT",
                headers: getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(data)
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized (401)");
        }

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `PUT ${endpoint} failed with status ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("API PUT Error:", error);
        throw error;
    }
}


// Generic DELETE request
async function apiDelete(endpoint) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized (401)");
        }

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `DELETE ${endpoint} failed with status ${response.status}`);
        }

        return true;

    } catch (error) {
        console.error("API DELETE Error:", error);
        throw error;
    }
}


// Generic PATCH request
async function apiPatch(endpoint, data = {}) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "PATCH",
                headers: getAuthHeaders({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(data)
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized (401)");
        }

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `PATCH ${endpoint} failed with status ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("API PATCH Error:", error);
        throw error;
    }
}