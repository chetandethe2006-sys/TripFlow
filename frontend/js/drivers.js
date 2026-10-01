// ============================================
// TripFlow - Drivers Module
// ============================================

// Get all drivers
async function getDrivers() {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers`);

        if (!response.ok) {
            throw new Error("Failed to fetch drivers");
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching drivers:", error);
        return [];
    }
}


// Get driver by ID
async function getDriverById(driverId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/drivers/${driverId}`
        );

        if (!response.ok) {
            throw new Error("Driver not found");
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching driver:", error);
        return null;
    }
}


// Create new driver
async function createDriver(driverData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/drivers`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(driverData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create driver");
        }

        return await response.json();

    } catch (error) {
        console.error("Error creating driver:", error);
        return null;
    }
}


// Update driver
async function updateDriver(driverId, driverData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/drivers/${driverId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(driverData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update driver");
        }

        return await response.json();

    } catch (error) {
        console.error("Error updating driver:", error);
        return null;
    }
}


// Delete driver
async function deleteDriver(driverId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/drivers/${driverId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete driver");
        }

        return true;

    } catch (error) {
        console.error("Error deleting driver:", error);
        return false;
    }
}


// Change driver availability
async function updateDriverAvailability(driverId, availability) {
    try {
        return await updateDriver(driverId, {
            availability: availability
        });

    } catch (error) {
        console.error(
            "Error updating driver availability:",
            error
        );

        return null;
    }
}