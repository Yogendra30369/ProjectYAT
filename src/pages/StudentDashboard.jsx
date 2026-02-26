import React from 'react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, CalendarClock, ClipboardList, PlayCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const StudentDashboard = () => {
    const { user } = useAuth();
    const { getEnrolledCourses, unenroll, getCourseProgress, getUpcomingTasks } = useCourses();
    const enrolledCourses = getEnrolledCourses(user.id);
    const upcomingTasks = getUpcomingTasks(user.id);

    const totalProgress = enrolledCourses.length > 0
        ? Math.round(
            enrolledCourses.reduce((acc, course) => {
                return acc + getCourseProgress(user.id, course.id, course.modules?.length || 0);
            }, 0) / enrolledCourses.length
        )
        : 0;

    const dueDateFormatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short'
    });

    const getCourseTag = (courseTitle) => {
        const titleParts = (courseTitle || '').split(' ').filter(Boolean);
        return titleParts[0] || 'Course';
    };

    const handleUnenroll = (courseId) => {
        if (window.confirm("Are you sure you want to unenroll from this course? Your progress will be lost.")) {
            unenroll(user.id, courseId);
        }
    };

    return (
        <div className={styles.dashboardPage}>
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

            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                        <BookOpen size={22} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Enrolled Courses</p>
                        <p className={styles.statValue}>{enrolledCourses.length}</p>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
                        <Target size={22} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Overall Progress</p>
                        <p className={styles.statValue}>{totalProgress}%</p>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'var(--warning)', color: 'white', opacity: 0.85 }}>
                        <ClipboardList size={22} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Pending Assignments</p>
                        <p className={styles.statValue}>{upcomingTasks.length}</p>
                    </div>
                </Card>
            </div>

            {enrolledCourses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)' }}>
                    <h3>You are not enrolled in any courses yet.</h3>
                    <p>Explore our catalog to start learning.</p>
                    <Link to="/courses"><Button style={{ marginTop: '1rem' }}>Browse Courses</Button></Link>
                </div>
            ) : (
                <div className={styles.studentLayout}>
                    <section>
                        <h2 className={styles.sectionTitle}>My Courses</h2>
                        <div className={styles.courseGrid}>
                            {enrolledCourses.map(course => {
                                const progress = getCourseProgress(user.id, course.id, course.modules?.length || 0);

                                return (
                                <Card key={course.id} hoverable className={styles.courseCard}>
                                    <div className={styles.courseHeader}>
                                        <h3>{course.title}</h3>
                                    </div>
                                    <p className={styles.courseDesc}>{course.description}</p>
                                    <div className={styles.courseBody}>
                                        <div className={styles.progressHeader}>
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className={styles.actionsRow}>
                                            <Link to={`/courses/${course.id}`} className={styles.continueLink}>
                                                <Button style={{ width: '100%' }}>
                                                    <PlayCircle size={18} /> Continue
                                                </Button>
                                            </Link>
                                            <Button variant="outline" onClick={() => handleUnenroll(course.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                                Unenroll
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </section>

                    <aside className={styles.sideColumn}>
                        <Card className={styles.upcomingSection}>
                            <div className={styles.upcomingHeader}>
                                <h2>Upcoming Tasks</h2>
                                <CalendarClock size={20} />
                            </div>
                            {upcomingTasks.length > 0 ? (
                                <ul className={styles.taskList}>
                                    {upcomingTasks.map(task => (
                                        <li key={task.id} className={styles.taskItem}>
                                            <span className={styles.taskTitle}>
                                                {task.assignmentTitle} – {getCourseTag(task.courseTitle)}
                                            </span>
                                            <span className={styles.taskDue}>Due: {dueDateFormatter.format(task.dueDate)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyTaskText}>No pending assignments right now.</p>
                            )}
                        </Card>
                    </aside>
                </div>
            )}
        </div>
        </div>
    );
};
