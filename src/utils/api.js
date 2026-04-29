import axios from 'axios';

// Use relative `/api` during development so the Vite dev server proxy can forward requests
// to the backend and avoid CORS issues. In production use the real backend URL.
export const API_BASE_URL = import.meta.env.DEV
    ? '/api'
    : 'https://projectyat-backend-production-6dec.up.railway.app/api/';

// Session/Token management
const SESSION_KEY_PREFIX = 'yat_session_';
const TOKEN_KEY = `${SESSION_KEY_PREFIX}token`;
const TOKEN_EXPIRY_KEY = `${SESSION_KEY_PREFIX}token_expiry`;

/**
 * Get stored access token
 */
export const getStoredToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store access token with expiry
 */
export const storeToken = (token, expiresAtMs) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAtMs));
};

/**
 * Clear stored tokens (logout)
 */
export const clearStoredToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
    const expiryMs = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) || '-1', 10);
    if (expiryMs <= 0) return true;
    return Date.now() > expiryMs;
};

/**
 * Get token expiry in milliseconds from now
 */
export const getTokenExpiryIn = () => {
    const expiryMs = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) || '0', 10);
    return Math.max(0, expiryMs - Date.now());
};

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for injecting token
apiClient.interceptors.request.use(
    (config) => {
        const token = getStoredToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors (like 401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            clearStoredToken();
            window.dispatchEvent(new CustomEvent('session-expired'));
        }
        
        // Extract error message
        const message = error.response?.data?.message || 
                        error.response?.data || 
                        error.message || 
                        'API Request Failed';
        
        return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
    }
);

/**
 * Wrapper function to maintain backward compatibility with existing fetchApi calls
 */
export const fetchApi = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers = {} } = options;
    
    // Check if body is FormData
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    
    // Strip leading slash if present to ensure the endpoint is treated as relative to API_BASE_URL.
    // Axios treats URLs starting with / as absolute paths, which would bypass the /api prefix.
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // Create a local config for this request
    const config = {
        url: cleanEndpoint,
        method: method.toUpperCase(),
        data: body,
        headers: { ...headers }
    };

    // If body is a string, try to parse it if it looks like JSON
    // This is because the legacy code often manually calls JSON.stringify(body)
    if (typeof body === 'string' && body.trim().startsWith('{')) {
        try {
            config.data = JSON.parse(body);
        } catch {
            // Not JSON or parse failed, leave as string
            config.data = body;
        }
    }

    // Axios handles FormData automatically and sets the correct boundary.
    // If it's NOT FormData and Content-Type isn't set, default to application/json for POST/PUT/PATCH
    const needsJsonHeader = !isFormData && 
                             ['POST', 'PUT', 'PATCH'].includes(config.method) && 
                             !config.headers['Content-Type'] && 
                             !config.headers['content-type'];
    
    if (needsJsonHeader) {
        config.headers['Content-Type'] = 'application/json';
    }

    const response = await apiClient(config);
    return response.data;
};

export default apiClient;


