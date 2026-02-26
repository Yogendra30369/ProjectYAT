import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Mail, User } from 'lucide-react';

export const StudentsList = () => {
    const navigate = useNavigate();
    const { users } = useAuth();
    const { getEnrolledCourses } = useCourses();

    const students = users
        .filter(user => user.role === 'student')
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="container" style={{ maxWidth: '900px', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Button variant="ghost" onClick={() => navigate('/educator')} style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Total Students</h1>
                    <p style={{ color: 'var(--gray-500)', margin: 0 }}>All registered students in the platform</p>
                </div>
            </div>

            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Students ({students.length})</h3>
                </div>

                {students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <User size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No students found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {students.map(student => {
                            const enrolledCount = getEnrolledCourses(student.id).length;

                            return (
                                <div
                                    key={student.id}
                                    style={{
                                        border: '1px solid var(--gray-200)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.9rem 1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-100)',
                                            color: 'var(--primary-600)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600
                                        }}>
                                            {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{student.name}</p>
                                            <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Mail size={14} /> {student.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem', fontWeight: 500 }}>
                                        Enrolled courses: {enrolledCount}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};
