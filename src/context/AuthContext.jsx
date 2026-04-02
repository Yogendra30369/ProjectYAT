import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '../utils/api';

const AuthContext = createContext();
const USERS_DB_STORAGE_KEY = 'usersDb';

const parseJsonOrFallback = (value, fallback) => {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeRole = (roleValue = '', emailValue = '') => {
    const rawRole = String(roleValue || '').toLowerCase();
    if (rawRole.includes('educator') || rawRole.includes('admin') || rawRole.includes('teacher')) {
        return 'educator';
    }

    if (rawRole.includes('student')) {
        return 'student';
    }

    const email = String(emailValue || '').toLowerCase();
    if (email.includes('educator') || email.includes('admin') || email.includes('teacher')) {
        return 'educator';
    }

    return 'student';
};

const toSafeUser = (candidateUser = {}) => {
    const id = candidateUser.id ?? candidateUser.userId ?? candidateUser.user_id;
    const email = candidateUser.email || candidateUser.username || '';

    if (id === undefined || id === null || !email) {
        return null;
    }

    return {
        id: String(id),
        name: candidateUser.name || candidateUser.fullName || candidateUser.username || email.split('@')[0],
        email,
        role: normalizeRole(candidateUser.role, email)
    };
};

const extractUsersFromResponse = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const listLikeKeys = ['data', 'items', 'content', 'users', 'records'];
    for (const key of listLikeKeys) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }
    }

    return [];
};

const mergeUsers = (currentUsers, incomingUsers) => {
    const mergedMap = new Map();

    [...currentUsers, ...incomingUsers].forEach((candidateUser) => {
        const safeUser = toSafeUser(candidateUser);
        if (!safeUser) {
            return;
        }

        const key = safeUser.email.toLowerCase();
        mergedMap.set(key, safeUser);
    });

    return Array.from(mergedMap.values());
};

const isLegacyMockId = (value) => /^u\d+$/i.test(String(value || ''));

const getLoginMessageText = (payload) => {
    if (typeof payload === 'string') {
        return payload;
    }

    if (!payload || typeof payload !== 'object') {
        return '';
    }

    return String(payload.message || payload.status || payload.result || '');
};

const isLoginSuccessful = (payload) => {
    if (typeof payload === 'string') {
        return payload.toLowerCase().includes('successful');
    }

    if (!payload || typeof payload !== 'object') {
        return false;
    }

    if (payload.success === true) {
        return true;
    }

    const messageText = getLoginMessageText(payload).toLowerCase();
    return messageText.includes('successful') || messageText.includes('success');
};

const extractBackendUserId = (payload) => {
    if (payload && typeof payload === 'object') {
        const objectId = payload.userId ?? payload.id ?? payload.user?.id ?? payload.data?.id;
        if (objectId !== undefined && objectId !== null && String(objectId).trim()) {
            return String(objectId);
        }
    }

    const text = getLoginMessageText(payload);
    if (!text) {
        return '';
    }

    const idPatternMatch = text.match(/user\s*id\s*[:=]\s*(\d+)/i);
    if (idPatternMatch?.[1]) {
        return idPatternMatch[1];
    }

    const genericIdMatch = text.match(/\bid\s*[:=]\s*(\d+)\b/i);
    if (genericIdMatch?.[1]) {
        return genericIdMatch[1];
    }

    return '';
};

const extractBackendRole = (payload) => {
    if (payload && typeof payload === 'object') {
        return payload.role || payload.user?.role || payload.data?.role || '';
    }

    const text = getLoginMessageText(payload);
    const roleMatch = text.match(/role\s*[:=]\s*([A-Za-z]+)/i);
    return roleMatch?.[1] || '';
};

const extractBackendName = (payload) => {
    if (payload && typeof payload === 'object') {
        return payload.name || payload.user?.name || payload.data?.name || '';
    }

    const text = getLoginMessageText(payload);
    const nameMatch = text.match(/name\s*[:=]\s*([^,]+)/i);
    return nameMatch?.[1]?.trim() || '';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });
    const [usersDb, setUsersDb] = useState(() => {
        const storedUsersDb = localStorage.getItem(USERS_DB_STORAGE_KEY);
        const parsedUsers = parseJsonOrFallback(storedUsersDb, []);

        const sanitizedUsers = Array.isArray(parsedUsers)
            ? parsedUsers
                .map(toSafeUser)
                .filter(Boolean)
                .filter((candidateUser) => !isLegacyMockId(candidateUser.id))
            : [];

        localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(sanitizedUsers));
        return sanitizedUsers;
    });

    useEffect(() => {
        const loadUsersFromBackend = async () => {
            const endpoints = ['/users/all', '/users', '/auth/users', '/auth/all'];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetchApi(endpoint);
                    const list = extractUsersFromResponse(response)
                        .map(toSafeUser)
                        .filter(Boolean);

                    if (list.length === 0) {
                        continue;
                    }

                    setUsersDb((previousUsers) => {
                        const mergedUsers = mergeUsers(previousUsers, list);
                        localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(mergedUsers));
                        return mergedUsers;
                    });

                    return;
                } catch {
                    // Try the next candidate endpoint.
                }
            }
        };

        loadUsersFromBackend();
    }, []);

    const resolveUserByEmailFromBackend = async (email) => {
        const endpoints = ['/users/all', '/users', '/auth/users', '/auth/all'];

        for (const endpoint of endpoints) {
            try {
                const response = await fetchApi(endpoint);
                const matchedUser = extractUsersFromResponse(response)
                    .map(toSafeUser)
                    .filter(Boolean)
                    .find((candidateUser) => candidateUser.email.toLowerCase() === email.toLowerCase());

                if (matchedUser) {
                    return matchedUser;
                }
            } catch {
                // Try next endpoint.
            }
        }

        return null;
    };

    // Login with email and password
    const loginWithCredentials = async (email, password) => {
        try {
            const data = await fetchApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (isLoginSuccessful(data)) {
                const backendUserId = extractBackendUserId(data);
                const roleFromResponse = extractBackendRole(data);

                const role = normalizeRole(roleFromResponse, email);
                
                let foundUser = usersDb.find((candidateUser) => candidateUser.email.toLowerCase() === email.toLowerCase());

                if (!foundUser) {
                    const userFromBackendLookup = await resolveUserByEmailFromBackend(email);
                    if (userFromBackendLookup) {
                        foundUser = userFromBackendLookup;
                    }
                }

                if (!foundUser) {
                    if (!backendUserId) {
                        return {
                            success: false,
                            error: 'Login succeeded but user identity could not be resolved from database. Please contact support.'
                        };
                    }

                    foundUser = {
                        id: String(backendUserId),
                        name: extractBackendName(data) || email.split('@')[0],
                        email,
                        role
                    };

                    const updatedUsersDb = [...usersDb, foundUser];
                    setUsersDb(updatedUsersDb);
                    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(updatedUsersDb));
                } else {
                    let needsSync = false;
                    
                    if (backendUserId && String(foundUser.id) !== String(backendUserId)) {
                        foundUser.id = String(backendUserId);
                        needsSync = true;
                    }
                    
                    const nameFromBackend = extractBackendName(data);
                    if (nameFromBackend && (!foundUser.name || foundUser.name === email.split('@')[0])) {
                        foundUser.name = nameFromBackend;
                        needsSync = true;
                    }
                    
                    if (needsSync) {
                        const updatedUsersDb = usersDb.map((candidateUser) =>
                            candidateUser.email.toLowerCase() === email.toLowerCase() ? foundUser : candidateUser
                        );
                        setUsersDb(updatedUsersDb);
                        localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(updatedUsersDb));
                    }
                }
                
                setUser(foundUser);
                localStorage.setItem('user', JSON.stringify(foundUser));
                return { success: true, user: foundUser };
            } else {
                return { success: false, error: data };
            }
        } catch (error) {
            console.error("Login API Error:", error);
            return { success: false, error: 'Unable to login. Please verify backend is running and credentials are valid.' };
        }
    };

    // Sign up new student
    const signup = async (name, email, password) => {
        try {
            const data = await fetchApi('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            if (data.includes('OTP sent')) {
                return { success: true, message: data };
            } else {
                return { success: false, error: data };
            }
        } catch (error) {
            console.error("Signup API Error:", error);
            return { success: false, error: 'Unable to register. Please ensure backend is available.' };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const data = await fetchApi('/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ email, otp })
            });

            if (data.includes('Verified successfully')) {
                return { success: true, message: data };
            } else {
                return { success: false, error: data };
            }
        } catch (error) {
            console.error("Verify OTP API Error:", error);
            return { success: false, error: 'Failed to verify OTP' };
        }
    };

    const getStudentCount = () => usersDb.filter((candidateUser) => candidateUser.role === 'student').length;
    const users = usersDb;

    // Legacy login method (for backwards compatibility)
    const login = () => {
        // Deprecated: role shortcuts removed to avoid hardcoded users.
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            users,
            login, 
            loginWithCredentials,
            signup,
            verifyOTP,
            getStudentCount,
            logout, 
            isAuthenticated: !!user 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
