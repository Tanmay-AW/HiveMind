// HiveMind Configuration

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const CONFIG = {
    FRONTEND_URL: isLocalhost
        ? "http://localhost:8080"
        : "https://hive-mind-puce.vercel.app",

    BACKEND_URL: isLocalhost
        ? "http://localhost:3000" // ✅ CORRECT PORT NOW
        : "https://hivemind-backend-9u2f.onrender.com",

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

function getApiUrl(endpoint) {
    return CONFIG.BACKEND_URL + endpoint;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl };
}
