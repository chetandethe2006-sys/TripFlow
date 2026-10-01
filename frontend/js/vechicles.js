// ============================================
// TripFlow - Vehicles Module
// ============================================


// Get all vehicles
async function getVehicles() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/vehicles`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch vehicles");
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return [];
    }
}


// Get vehicle by ID
async function getVehicleById(vehicleId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/vehicles/${vehicleId}`
        );

        if (!response.ok) {
            throw new Error("Vehicle not found");
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return null;
    }
}


// Create new vehicle
async function createVehicle(vehicleData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/vehicles`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(vehicleData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create vehicle");
        }

        return await response.json();

    } catch (error) {
        console.error("Error creating vehicle:", error);
        return null;
    }
}


// Update vehicle
async function updateVehicle(vehicleId, vehicleData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/vehicles/${vehicleId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(vehicleData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update vehicle");
        }

        return await response.json();

    } catch (error) {
        console.error("Error updating vehicle:", error);
        return null;
    }
}


// Delete vehicle
async function deleteVehicle(vehicleId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/vehicles/${vehicleId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete vehicle");
        }

        return true;

    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return false;
    }
}


// Update vehicle availability
async function updateVehicleAvailability(
    vehicleId,
    availability
) {
    try {

        return await updateVehicle(vehicleId, {
            availability: availability
        });

    } catch (error) {

        console.error(
            "Error updating vehicle availability:",
            error
        );

        return null;
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

        return null;
    }
}