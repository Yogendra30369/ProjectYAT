import React from 'react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const CourseBrowser = () => {
    const { courses, enroll, getEnrolledCourses } = useCourses();
    const { user } = useAuth();
    const navigate = useNavigate();

    const enrolledIds = getEnrolledCourses(user.id).map(c => c.id);

    const handleEnroll = (courseId) => {
        enroll(user.id, courseId);
        navigate('/student');
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Explore Courses</h1>

            <div className={styles.courseGrid}>
                {courses.map(course => {
                    const isEnrolled = enrolledIds.includes(course.id);
                    return (
                        <Card key={course.id} className={styles.courseCard}>
                            <div className={styles.courseHeader}>
                                <h3>{course.title}</h3>
                                {isEnrolled && <span className={styles.badge} style={{ color: 'var(--success)', background: 'var(--gray-50)' }}><CheckCircle size={14} /> Enrolled</span>}
                            </div>
                            <p className={styles.courseDesc}>{course.description}</p>
                            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
                                {isEnrolled ? (
                                    <Link to={`/courses/${course.id}`}>
                                        <Button variant="outline" style={{ width: '100%' }}>Go to Course</Button>
                                    </Link>
                                ) : (
                                    <Button onClick={() => handleEnroll(course.id)} style={{ width: '100%' }}>
                                        Enroll Now
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
