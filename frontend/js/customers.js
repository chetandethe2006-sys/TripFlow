// ============================================
// TripFlow - Customers Module
// ============================================


// Get all customers
async function getCustomers() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/customers`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch customers");
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
}


// Get customer by ID
async function getCustomerById(customerId) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/customers/${customerId}`
        );

        if (!response.ok) {
            throw new Error("Customer not found");
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching customer:", error);
        return null;
    }
}


// Create new customer
async function createCustomer(customerData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/customers`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(customerData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create customer");
        }

        return await response.json();

    } catch (error) {
        console.error("Error creating customer:", error);
        return null;
    }
}


// Update customer
async function updateCustomer(
    customerId,
    customerData
) {
    try {

        const response = await fetch(
            `${API_BASE_URL}/customers/${customerId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(customerData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update customer");
        }

        return await response.json();

    } catch (error) {

        console.error(
            "Error updating customer:",
            error
        );

        return null;
    }
}


// Delete customer
async function deleteCustomer(customerId) {
    try {

        const response = await fetch(
            `${API_BASE_URL}/customers/${customerId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete customer");
        }

        return true;

    } catch (error) {

        console.error(
            "Error deleting customer:",
            error
        );

        return false;
    }
}


// Get customer's trips
async function getCustomerTrips(customerId) {
    try {

        const response = await fetch(
            `${API_BASE_URL}/customers/${customerId}/trips`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch customer trips"
            );
        }

        return await response.json();

    } catch (error) {

        console.error(
            "Error fetching customer trips:",
            error
        );

        return [];
    }
}