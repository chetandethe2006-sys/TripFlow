// ============================================
// TripFlow - Vehicles Module
// ============================================


// Get all vehicles
async function getVehicles() {
    try {
        return await apiGet("/vehicles");
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
    }
}


// Get vehicle by ID
async function getVehicleById(vehicleId) {
    try {
        return await apiGet(`/vehicles/${vehicleId}`);
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        throw error;
    }
}


// Create new vehicle
async function createVehicle(vehicleData) {
    try {
        return await apiPost("/vehicles", vehicleData);
    } catch (error) {
        console.error("Error creating vehicle:", error);
        throw error;
    }
}


// Update vehicle
async function updateVehicle(vehicleId, vehicleData) {
    try {
        return await apiPut(`/vehicles/${vehicleId}`, vehicleData);
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
}


// Delete vehicle
async function deleteVehicle(vehicleId) {
    try {
        return await apiDelete(`/vehicles/${vehicleId}`);
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        throw error;
    }
}


// Update vehicle availability
async function updateVehicleAvailability(
    vehicleId,
    availability
) {
    try {
        const isAvailable = availability === "Available" || availability === true;
        return await apiPut(`/vehicles/${vehicleId}/availability`, { available: isAvailable });
    } catch (error) {
        console.error(
            "Error updating vehicle availability:",
            error
        );
        throw error;
    }
}


// Assign driver to vehicle
async function assignDriverToVehicle(
    vehicleId,
    driverId
) {
    try {

        return await updateVehicle(vehicleId, {
            driverId: driverId
        });

    } catch (error) {

        console.error(
            "Error assigning driver to vehicle:",
            error
        );

        throw error;
    }
}
