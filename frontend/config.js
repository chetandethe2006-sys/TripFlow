// ============================================
// TripFlow - Frontend Runtime Configuration
// ============================================

// When deploying the frontend to Render as a separate Static Site:
// Set your live Render backend Web Service URL below:
// Example: window.TRIPFLOW_API_URL = "https://tripflow-backend.onrender.com/api";
//
// When deploying frontend and backend together as a single Render Web Service,
// or when running locally, leave this unset to automatically connect to the current origin / localhost:
window.TRIPFLOW_API_URL = window.TRIPFLOW_API_URL || undefined;
