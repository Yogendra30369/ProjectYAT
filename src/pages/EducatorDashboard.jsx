import React, { useEffect, useState } from 'react';
import { useCourses } from '../context/CourseContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlusCircle, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const EducatorDashboard = () => {
    const { courses } = useCourses();

    const getTotalStudents = () => {
        const storedStudents = localStorage.getItem('registeredStudents');

        if (!storedStudents) {
            return 1;
        }

        try {
            const parsedStudents = JSON.parse(storedStudents);
            return 1 + parsedStudents.length;
        } catch {
            return 1;
        }
    };

    const [totalStudents, setTotalStudents] = useState(getTotalStudents());

    useEffect(() => {
        const refreshStudentCount = () => setTotalStudents(getTotalStudents());

        window.addEventListener('studentsUpdated', refreshStudentCount);
        window.addEventListener('storage', refreshStudentCount);
        window.addEventListener('focus', refreshStudentCount);

        return () => {
            window.removeEventListener('studentsUpdated', refreshStudentCount);
            window.removeEventListener('storage', refreshStudentCount);
            window.removeEventListener('focus', refreshStudentCount);
        };
    }, []);

    return (
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
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--success)', color: 'white', opacity: 0.8 }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Students</p>
                        <p className={styles.statValue}>{totalStudents}</p>
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
                            <Button variant="outline" size="sm">Edit Content</Button>
                            <Button variant="ghost" size="sm">View Students</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
