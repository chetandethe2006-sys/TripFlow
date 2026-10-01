// ============================================
// TripFlow - API Configuration & Common API
// ============================================

const API_BASE_URL = "http://localhost:8080/api";


// Generic GET request
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`GET ${endpoint} failed`);
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

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(`POST ${endpoint} failed`);
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

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(`PUT ${endpoint} failed`);
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
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(`DELETE ${endpoint} failed`);
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

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(`PATCH ${endpoint} failed`);
        }

        return await response.json();

    } catch (error) {
        console.error("API PATCH Error:", error);
        throw error;
    }
}