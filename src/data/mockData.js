export const MOCK_COURSES = [
    {
        id: 'c1',
        title: 'React Frontend Essentials',
        description: 'Build modern UIs with React, JSX, state, and reusable components.',
        instructor: 'Jane Doe',
        modules: [
            { 
                id: 'm1', 
                title: 'Getting Started with React', 
                content: 'Learn how to set up your React development environment',
                videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk'
            },
            { 
                id: 'm2', 
                title: 'React Components and JSX', 
                content: 'Understanding components and JSX syntax',
                videoUrl: 'https://www.youtube.com/embed/RGKi6LSPDLU'
            },
            { 
                id: 'm3', 
                title: 'State and Props', 
                content: 'Learn about React state management and props',
                videoUrl: 'https://www.youtube.com/embed/4pO-HcG2igk'
            }
        ]
    },
    {
        id: 'c2',
        title: 'Modern JavaScript for Web Apps',
        description: 'Master JavaScript fundamentals, async programming, and DOM workflows.',
        instructor: 'John Smith',
        modules: [
            { 
                id: 'm1', 
                title: 'JavaScript Fundamentals', 
                content: 'Variables, functions, arrays, objects, and ES6 syntax.',
                videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg'
            },
            { 
                id: 'm2', 
                title: 'Asynchronous JavaScript', 
                content: 'Understand promises, async/await, and API calls.',
                videoUrl: 'https://www.youtube.com/embed/PoRJizFvM7s'
            },
            {
                id: 'm3',
                title: 'DOM and Browser APIs',
                content: 'Work with events, forms, and dynamic page updates.',
                videoUrl: 'https://www.youtube.com/embed/0ik6X4DJKCc'
            }
        ]
    },
    {
        id: 'c3',
        title: 'Node.js & Express Full-Stack APIs',
        description: 'Create backend APIs, connect databases, and power full-stack applications.',
        instructor: 'Jane Doe',
        modules: [
            { 
                id: 'm1', 
                title: 'Node.js Runtime Basics', 
                content: 'Understand Node.js architecture and package management.',
                videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4'
            },
            { 
                id: 'm2', 
                title: 'Build REST APIs with Express', 
                content: 'Create routes, controllers, and middleware in Express.',
                videoUrl: 'https://www.youtube.com/embed/l8WPWK9mS5M'
            },
            {
                id: 'm3',
                title: 'MongoDB Integration',
                content: 'Persist data and model resources with MongoDB and Mongoose.',
                videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A'
            }
        ]
    }
];

// Mock user database with passwords
export const MOCK_USERS_DB = [
    {
        id: 'u1',
        name: 'Jane Educator',
        role: 'educator',
        email: 'educator@course.com',
        password: 'educator123'
    },
    {
        id: 'u2',
        name: 'Alex Student',
        role: 'student',
        email: 'student@course.com',
        password: 'student123',
        enrolledCourses: ['c1', 'c2', 'c3']
    }
];

export const MOCK_USERS = {
    educator: {
        id: 'u1',
        name: 'Jane Educator',
        role: 'educator',
        email: 'educator@course.com'
    },
    student: {
        id: 'u2',
        name: 'Alex Student',
        role: 'student',
        email: 'student@course.com',
        enrolledCourses: ['c1', 'c2', 'c3']
    }
};

export const ALL_USERS = MOCK_USERS_DB.map(user => {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
});

