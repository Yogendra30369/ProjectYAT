import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS, MOCK_USERS_DB } from '../data/mockData';
import { fetchApi } from '../utils/api';

const AuthContext = createContext();
const USERS_DB_STORAGE_KEY = 'usersDb';

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
        const sanitizeUsersDb = (users) => {
            return (users || []).filter((candidateUser) => candidateUser.email !== 'sam@student.com');
        };

        const storedUsersDb = localStorage.getItem(USERS_DB_STORAGE_KEY);
        if (storedUsersDb) {
            const parsedUsers = JSON.parse(storedUsersDb);
            const sanitizedUsers = sanitizeUsersDb(parsedUsers);

            if (sanitizedUsers.length !== parsedUsers.length) {
                localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(sanitizedUsers));
            }

            return sanitizedUsers;
        }

        const defaultUsers = sanitizeUsersDb(MOCK_USERS_DB);
        localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(defaultUsers));
        return [...defaultUsers];
    });

    // Login with email and password
    const loginWithCredentials = async (email, password) => {
        try {
            const data = await fetchApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (data.includes('successful')) {
                // Fallback to determine role and local mock db
                const isEducator = email.includes('admin') || email.includes('educator');
                const role = isEducator ? 'educator' : 'student';
                
                let foundUser = usersDb.find(u => u.email === email);
                if (!foundUser) {
                    foundUser = {
                        id: `u${Date.now()}`,
                        name: email.split('@')[0],
                        email,
                        role: role,
                        enrolledCourses: []
                    };
                }
                
                const userWithoutPassword = { ...foundUser };
                delete userWithoutPassword.password;
                setUser(userWithoutPassword);
                localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                return { success: true, user: userWithoutPassword };
            } else {
                return { success: false, error: data };
            }
        } catch (error) {
            console.error("Login API Error:", error);
            // Local fallback logic
            const foundUser = usersDb.find(
                u => u.email === email && u.password === password
            );
            
            if (foundUser) {
                const userWithoutPassword = { ...foundUser };
                delete userWithoutPassword.password;
                setUser(userWithoutPassword);
                localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                return { success: true, user: userWithoutPassword };
            }
            
            return { success: false, error: 'Invalid email or password' };
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
            // Local fallback
            const existingUser = usersDb.find(u => u.email === email);
            if (existingUser) {
                return { success: false, error: 'Email already exists' };
            }

            const newUser = {
                id: `u${Date.now()}`,
                name,
                email,
                role: 'student',
                enrolledCourses: []
            };

            const updatedUsersDb = [...usersDb, { ...newUser, password }];
            setUsersDb(updatedUsersDb);
            localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(updatedUsersDb));
            
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return { success: true, user: newUser };
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

    const getStudentCount = () => usersDb.filter(u => u.role === 'student').length;
    const users = usersDb.map((dbUser) => {
        const safeUser = { ...dbUser };
        delete safeUser.password;
        return safeUser;
    });

    // Legacy login method (for backwards compatibility)
    const login = (role) => {
        const userData = MOCK_USERS[role];
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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
