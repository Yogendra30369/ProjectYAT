import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_COURSES } from '../data/mockData';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [enrolledMap, setEnrolledMap] = useState({}); // userId -> [courseId]

    useEffect(() => {
        // Initialize courses
        const storedCourses = localStorage.getItem('courses');
        if (storedCourses) {
            setCourses(JSON.parse(storedCourses));
        } else {
            setCourses(MOCK_COURSES);
            localStorage.setItem('courses', JSON.stringify(MOCK_COURSES));
        }

        // Initialize enrollments
        const storedEnrollments = localStorage.getItem('enrollments');
        if (storedEnrollments) {
            setEnrolledMap(JSON.parse(storedEnrollments));
        } else {
            // Seed default student enrollment
            const defaultEnrollments = { 'u2': ['c1'] };
            setEnrolledMap(defaultEnrollments);
            localStorage.setItem('enrollments', JSON.stringify(defaultEnrollments));
        }
    }, []);

    const addCourse = (newCourse) => {
        const updatedCourses = [...courses, { ...newCourse, id: Date.now().toString() }];
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
    };

    const enroll = (userId, courseId) => {
        const userEnrollments = enrolledMap[userId] || [];
        if (!userEnrollments.includes(courseId)) {
            const updatedMap = {
                ...enrolledMap,
                [userId]: [...userEnrollments, courseId]
            };
            setEnrolledMap(updatedMap);
            localStorage.setItem('enrollments', JSON.stringify(updatedMap));
        }
    };

    const getEnrolledCourses = (userId) => {
        const ids = enrolledMap[userId] || [];
        return courses.filter(c => ids.includes(c.id));
    };

    return (
        <CourseContext.Provider value={{ courses, addCourse, enroll, getEnrolledCourses }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourses = () => useContext(CourseContext);
