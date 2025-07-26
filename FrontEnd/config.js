// HiveMind Configuration
// Update these values when deploying or changing environments

const CONFIG = {
    // Frontend URL (Vercel deployment)
    FRONTEND_URL: "https://hive-mind-puce.vercel.app",
    
    // Backend URL (Render deployment)
    BACKEND_URL: "https://hivemind-backend-9u2f.onrender.com",
    
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