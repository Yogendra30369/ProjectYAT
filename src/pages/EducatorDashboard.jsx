import React from 'react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlusCircle, Users, BookOpen, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const EducatorDashboard = () => {
    const { courses, deleteCourse } = useCourses();
    const { getStudentCount } = useAuth();
    const navigate = useNavigate();

    const handleDelete = (courseId) => {
        if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            deleteCourse(courseId);
        }
    };

    return (
        <div className={styles.dashboardPage}>
        <div className="container" style={{ marginTop: '2rem' }}>

            <div className={styles.header}>
                <div>
                    <h1>Educator Dashboard</h1>
                    <p className={styles.subtitle}>Manage your courses and track student progress</p>
                </div>
                <Link to="/create-course">
                    <Button><PlusCircle size={20} /> Create Course</Button>
                </Link>
            </div>

            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Courses</p>
                        <p className={styles.statValue}>{courses.length}</p>
                    </div>
                </Card>
                <Card className={`${styles.statCard} ${styles.clickableCard}`} onClick={() => navigate('/students')} role="button" tabIndex={0} onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate('/students');
                    }
                }}>
                    <div className={styles.statIcon} style={{ background: 'var(--success)', color: 'white', opacity: 0.8 }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Students</p>
                        <p className={styles.statValue}>{getStudentCount()}</p>
                    </div>
                </Card>
            </div>

            <h2 style={{ marginBottom: '1rem' }}>Active Courses</h2>
            <div className={styles.courseGrid}>
                {courses.map(course => (
                    <Card key={course.id} hoverable className={styles.courseCard}>
                        <div className={styles.courseHeader}>
                            <h3>{course.title}</h3>
                            <span className={styles.badge}>{course.modules?.length || 0} Modules</span>
                        </div>
                        <p className={styles.courseDesc}>{course.description}</p>
                        <div className={styles.courseFooter}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-course/${course.id}`)}>Edit</Button>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/course-students/${course.id}`)}>Students</Button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} style={{ color: 'var(--danger)', padding: '0.5rem' }}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
        </div>
    );
};
