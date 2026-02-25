import React from 'react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const StudentDashboard = () => {
    const { user } = useAuth();
    const { getEnrolledCourses } = useCourses();
    const enrolledCourses = getEnrolledCourses(user.id);

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div className={styles.header}>
                <div>
                    <h1>My Learning</h1>
                    <p className={styles.subtitle}>Welcome back, {user.name}. Continue where you left off.</p>
                </div>
                <Link to="/courses">
                    <Button variant="outline">Browse All Courses</Button>
                </Link>
            </div>

            {enrolledCourses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)' }}>
                    <h3>You are not enrolled in any courses yet.</h3>
                    <p>Explore our catalog to start learning.</p>
                    <Link to="/courses"><Button style={{ marginTop: '1rem' }}>Browse Courses</Button></Link>
                </div>
            ) : (
                <div className={styles.courseGrid}>
                    {enrolledCourses.map(course => (
                        <Card key={course.id} hoverable className={styles.courseCard}>
                            <div className={styles.courseHeader}>
                                <h3>{course.title}</h3>
                            </div>
                            <p className={styles.courseDesc}>{course.description}</p>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--gray-600)' }}>
                                    <span>Progress</span>
                                    <span>0%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: '0%', height: '100%', background: 'var(--primary-600)' }}></div>
                                </div>
                                <Link to={`/courses/${course.id}`} style={{ display: 'block', marginTop: '1.5rem' }}>
                                    <Button style={{ width: '100%' }}>
                                        <PlayCircle size={18} /> Continue Learning
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
