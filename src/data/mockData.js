export const MOCK_COURSES = [
    {
        id: 'c1',
        title: 'Introduction to React',
        description: 'Learn the basics of React, components, state, and props.',
        instructor: 'Jane Doe',
        modules: [
            { id: 'm1', title: 'Getting Started', content: 'Video: Setting up environment...' },
            { id: 'm2', title: 'Components', content: 'Text: Understanding JSX...' }
        ]
    },
    {
        id: 'c2',
        title: 'Advanced Mathematics',
        description: 'Deep dive into calculus and linear algebra.',
        instructor: 'John Smith',
        modules: [
            { id: 'm1', title: 'Limits and Continuity', content: 'Video: LIMITS...' }
        ]
    }
];

export const MOCK_USERS = {
    educator: {
        id: 'u1',
        name: 'Jane Educator',
        role: 'educator',
        email: 'jane@edu.com'
    },
    student: {
        id: 'u2',
        name: 'Alex Student',
        role: 'student',
        email: 'alex@student.com',
        enrolledCourses: ['c1']
    }
};
