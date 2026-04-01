export const API_BASE_URL = 'http://localhost:8080/api';

export const fetchApi = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

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
