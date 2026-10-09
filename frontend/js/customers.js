// ============================================
// TripFlow - Customers Module
// ============================================


// Get all customers
async function getCustomers() {
    try {
        return await apiGet("/customers");
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
}


// Get customer by ID
async function getCustomerById(customerId) {
    try {
        return await apiGet(`/customers/${customerId}`);
    } catch (error) {
        console.error("Error fetching customer:", error);
        throw error;
    }
}


// Create new customer
async function createCustomer(customerData) {
    try {
        return await apiPost("/customers", customerData);
    } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
    }
}


// Update customer
async function updateCustomer(customerId, customerData) {
    try {
        return await apiPut(`/customers/${customerId}`, customerData);
    } catch (error) {
        console.error("Error updating customer:", error);
        throw error;
    }
}


// Delete customer
async function deleteCustomer(customerId) {
    try {
        return await apiDelete(`/customers/${customerId}`);
    } catch (error) {
        console.error("Error deleting customer:", error);
        throw error;
    }
}


// Get customer's trips
async function getCustomerTrips(customerId) {
    try {
        return await apiGet(`/customers/${customerId}/trips`);
    } catch (error) {
        console.error("Error fetching customer trips:", error);
        throw error;
    }
}
