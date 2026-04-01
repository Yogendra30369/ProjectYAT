import React from 'react';
import { Card } from '../components/Card';

export const AboutUs = () => {
    return (
        <div className="container" style={{ maxWidth: '960px', marginTop: '2rem' }}>
            <Card>
                <h1 style={{ marginBottom: '1rem' }}>About CourseMinds</h1>

                <p style={{ color: 'var(--gray-700)', marginBottom: '1rem' }}>
                    CourseMinds is an online course management system designed to simplify digital teaching and learning. Our platform enables educators to create, manage, and deliver structured online courses while allowing students to enroll, access learning materials, submit assignments, and track their progress efficiently.
                </p>

                <p style={{ color: 'var(--gray-700)', marginBottom: '1.5rem' }}>
                    We aim to provide a seamless and user-friendly environment that enhances the online education experience for both instructors and learners.
                </p>

                <section style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>👩‍🏫 For Educators</h2>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--gray-700)', display: 'grid', gap: '0.4rem' }}>
                        <li>Create and manage courses</li>
                        <li>Upload videos, notes, and resources</li>
                        <li>Create assignments and assessments</li>
                        <li>Track student performance and progress</li>
                        <li>Monitor submissions and grading</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>🎓 For Students</h2>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--gray-700)', display: 'grid', gap: '0.4rem' }}>
                        <li>Enroll in courses</li>
                        <li>Access course materials anytime</li>
                        <li>Submit assignments online</li>
                        <li>View grades and feedback</li>
                        <li>Track learning progress</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>🚀 Why Choose CourseMinds?</h2>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--gray-700)', display: 'grid', gap: '0.4rem' }}>
                        <li>Simple and intuitive interface</li>
                        <li>Secure user authentication</li>
                        <li>Role-based access (Admin & Student)</li>
                        <li>Real-time progress tracking</li>
                        <li>Assignment and assessment management</li>
                    </ul>
                </section>
            </Card>
        </div>
    );
};
