// ============================================
// TripFlow - Drivers Module
// ============================================

// Get all drivers
async function getDrivers() {
    try {
        return await apiGet("/drivers");
    } catch (error) {
        console.error("Error fetching drivers:", error);
        throw error;
    }
}


// Get driver by ID
async function getDriverById(driverId) {
    try {
        return await apiGet(`/drivers/${driverId}`);
    } catch (error) {
        console.error("Error fetching driver:", error);
        throw error;
    }
}


// Create new driver
async function createDriver(driverData) {
    try {
        return await apiPost("/drivers", driverData);
    } catch (error) {
        console.error("Error creating driver:", error);
        throw error;
    }
}


// Update driver
async function updateDriver(driverId, driverData) {
    try {
        return await apiPut(`/drivers/${driverId}`, driverData);
    } catch (error) {
        console.error("Error updating driver:", error);
        throw error;
    }
}


// Delete driver
async function deleteDriver(driverId) {
    try {
        return await apiDelete(`/drivers/${driverId}`);
    } catch (error) {
        console.error("Error deleting driver:", error);
        throw error;
    }
}


// Change driver availability
async function updateDriverAvailability(driverId, availability) {
    try {
        const isAvailable = availability === "Available" || availability === true;
        return await apiPut(`/drivers/${driverId}/availability`, { available: isAvailable });
    } catch (error) {
        console.error("Error updating driver availability:", error);
        throw error;
    }
}

