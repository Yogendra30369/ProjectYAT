const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

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

export const fetchApi = async (endpoint, options = {}) => {
    try {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
        const mergedHeaders = {
            ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
            ...(options.headers || {}),
        };

        // Inject authorization token if available
        const token = getStoredToken();
        if (token) {
            mergedHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
            ...options,
            headers: mergedHeaders,
        });

        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
            clearStoredToken();
            // Signal to AuthContext to handle logout
            window.dispatchEvent(new CustomEvent('session-expired'));
            throw new Error('Session expired. Please login again.');
        }

        const isJson = response.headers.get('content-type')?.includes('application/json');
        
        let data;
        if (isJson) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(data || 'API Request Failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
