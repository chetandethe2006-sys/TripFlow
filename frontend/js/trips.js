// ============================================
// TripFlow - Trips Module
// ============================================


// Get all trips
async function getTrips() {

    try {

        return await apiGet("/trips");

    } catch (error) {

        console.error(
            "Error loading trips:",
            error
        );

        return [];
    }
}


// Get trip by ID
async function getTripById(tripId) {

    try {

        return await apiGet(
            `/trips/${tripId}`
        );

    } catch (error) {

        console.error(
            "Error loading trip:",
            error
        );

        return null;
    }
}


// Create trip
async function createTrip(tripData) {

    try {

        return await apiPost(
            "/trips",
            tripData
        );

    } catch (error) {

        console.error(
            "Error creating trip:",
            error
        );

        return null;
    }
}


// Update trip
async function updateTrip(
    tripId,
    tripData
) {

    try {

        return await apiPut(
            `/trips/${tripId}`,
            tripData
        );

    } catch (error) {

        console.error(
            "Error updating trip:",
            error
        );

        return null;
    }
}


// Delete trip
async function deleteTrip(tripId) {

    try {

        await apiDelete(
            `/trips/${tripId}`
        );

        return true;

    } catch (error) {

        console.error(
            "Error deleting trip:",
            error
        );

        return false;
    }
}


// Update trip status
async function updateTripStatus(
    tripId,
    status
) {

    try {

        return await apiPatch(
            `/trips/${tripId}/status`,
            {
                status: status
            }
        );

    } catch (error) {

        console.error(
            "Error updating trip status:",
            error
        );

        return null;
    }
}


// Assign driver to trip
async function assignDriverToTrip(
    tripId,
    driverId
) {

    try {

        return await apiPut(
            `/trips/${tripId}`,
            {
                driverId: driverId
            }
        );

    } catch (error) {

        console.error(
            "Error assigning driver:",
            error
        );

        return null;
    }
}


// Assign vehicle to trip
async function assignVehicleToTrip(
    tripId,
    vehicleId
) {

    try {

        return await apiPut(
            `/trips/${tripId}`,
            {
                vehicleId: vehicleId
            }
        );

    } catch (error) {

        console.error(
            "Error assigning vehicle:",
            error
        );

        return null;
    }
}