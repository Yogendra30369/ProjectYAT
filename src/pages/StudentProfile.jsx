import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { Card } from '../components/Card';
import styles from './StudentProfile.module.css';

export const StudentProfile = () => {
    const { user } = useAuth();
    const { getEnrolledCourses, getCourseProgress } = useCourses();

    const enrolledCourses = getEnrolledCourses(user.id);

    return (
        <div className={styles.profilePage}>
            <div className="container" style={{ marginTop: '2rem' }}>
                <div className={styles.header}>
                    <h1>Student Profile</h1>
                    <p className={styles.subtitle}>Your account details and learning progress.</p>
                </div>

                <Card className={styles.detailsCard}>
                    <h2 className={styles.sectionTitle}>Profile Details</h2>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <p className={styles.detailLabel}>Name</p>
                            <p className={styles.detailValue}>{user.name}</p>
                        </div>
                        <div className={styles.detailItem}>
                            <p className={styles.detailLabel}>Email</p>
                            <p className={styles.detailValue}>{user.email}</p>
                        </div>
                        <div className={styles.detailItem}>
                            <p className={styles.detailLabel}>Role</p>
                            <p className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{user.role}</p>
                        </div>
                        <div className={styles.detailItem}>
                            <p className={styles.detailLabel}>Registered Courses</p>
                            <p className={styles.detailValue}>{enrolledCourses.length}</p>
                        </div>
                    </div>
                </Card>

                <div className={styles.progressSection}>
                    <h2 className={styles.sectionTitle}>Course Progress</h2>

                    {enrolledCourses.length === 0 ? (
                        <Card>
                            <p className={styles.emptyState}>No registered courses yet.</p>
                        </Card>
                    ) : (
                        <div className={styles.progressList}>
                            {enrolledCourses.map((course) => {
                                const totalModules = course.modules?.length || 0;
                                const progress = getCourseProgress(user.id, course.id, totalModules);

                                return (
                                    <Card key={course.id} className={styles.progressCard}>
                                        <div className={styles.progressHeader}>
                                            <h3 className={styles.courseTitle}>{course.title}</h3>
                                            <span className={styles.percent}>{progress}%</span>
                                        </div>
                                        <p className={styles.moduleText}>{totalModules} modules</p>
                                        <div className={styles.progressBarTrack}>
                                            <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
