// HiveMind Configuration
// Update these values when deploying or changing environments

const CONFIG = {
    // Frontend URL (Vercel deployment)
    FRONTEND_URL: "https://hive-mind-puce.vercel.app",
    
    // Backend URL - UPDATE THIS WHEN BACKEND IS DEPLOYED
    // For local development: "http://localhost:3000"
    // For production: "https://your-backend-url.com"
    BACKEND_URL: "https://hive-mind-puce.vercel.app", // Temporary - will be updated with actual backend URL
    
    // API Endpoints
    API_ENDPOINTS: {
        AUTH: {
            LOGIN: "/api/auth/login",
            SIGNUP: "/api/auth/signup",
            VERIFY_OTP: "/api/auth/verify-otp",
            RESEND_OTP: "/api/auth/resend-otp",
            PROFILE: "/api/auth/profile"
        },
        AI: {
            RUN: "/api/ai/run",
            GENERATE: "/api/ai/generate",
            EXPLAIN: "/api/ai/explain",
            DEBUG: "/api/ai/debug"
        }
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.BACKEND_URL + endpoint;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl };
} 