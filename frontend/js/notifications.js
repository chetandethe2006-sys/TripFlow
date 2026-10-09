// ============================================
// TripFlow - Notifications Module
// ============================================


// Get all notifications
async function getNotifications() {

    try {

        return await apiGet(
            "/notifications"
        );

    } catch (error) {

        console.error(
            "Error loading notifications:",
            error
        );

        throw error;
    }
}


// Get notification by ID
async function getNotificationById(
    notificationId
) {

    try {

        return await apiGet(
            `/notifications/${notificationId}`
        );

    } catch (error) {

        console.error(
            "Error loading notification:",
            error
        );

        throw error;
    }
}


// Mark notification as read
async function markNotificationAsRead(
    notificationId
) {

    try {

        return await apiPatch(
            `/notifications/${notificationId}/read`
        );

    } catch (error) {

        console.error(
            "Error marking notification as read:",
            error
        );

        throw error;
    }
}


// Mark all notifications as read
async function markAllNotificationsAsRead() {

    try {

        return await apiPatch(
            "/notifications/read-all"
        );

    } catch (error) {

        console.error(
            "Error marking notifications as read:",
            error
        );

        throw error;
    }
}


// Delete notification
async function deleteNotification(
    notificationId
) {

    try {

        await apiDelete(
            `/notifications/${notificationId}`
        );

        return true;

    } catch (error) {

        console.error(
            "Error deleting notification:",
            error
        );

        return false;
    }
}
