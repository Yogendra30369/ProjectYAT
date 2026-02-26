import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const getRegisteredStudents = () => {
        const storedStudents = localStorage.getItem('registeredStudents');
        return storedStudents ? JSON.parse(storedStudents) : [];
    };

    // Check localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (role, email) => {
        let userData = MOCK_USERS[role];

        if (role === 'student') {
            const registeredStudents = getRegisteredStudents();

            if (email) {
                const matchedStudent = registeredStudents.find(
                    (student) => student.email.toLowerCase() === email.toLowerCase()
                );
                if (matchedStudent) {
                    userData = matchedStudent;
                }
            } else if (registeredStudents.length > 0) {
                userData = registeredStudents[registeredStudents.length - 1];
            }
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const registerStudent = ({ name, email, password }) => {
        const registeredStudents = getRegisteredStudents();

        const existingStudent = registeredStudents.find(
            (student) => student.email.toLowerCase() === email.toLowerCase()
        );

        const userData = existingStudent || {
            id: `u${Date.now()}`,
            name,
            role: 'student',
            email,
            password,
            enrolledCourses: []
        };

        if (!existingStudent) {
            const updatedStudents = [...registeredStudents, userData];
            localStorage.setItem('registeredStudents', JSON.stringify(updatedStudents));
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerStudent, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
