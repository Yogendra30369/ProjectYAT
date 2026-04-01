import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, PlusCircle, LayoutDashboard, CircleUserRound } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const logoDestination = user?.role === 'educator' ? '/educator' : '/student';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className={styles.navbar}>
            <div className="container">
                <div className={styles.inner}>
                    <Link to={logoDestination} className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <BookOpen size={20} color="white" />
                        </div>
                        <span className={styles.logoText}>CourseMinds</span>
                    </Link>

                    <div className={styles.links}>
                        {user.role === 'educator' ? (
                            <>
                                <Link to="/educator" className={styles.link}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <Link to="/create-course" className={styles.link}>
                                    <PlusCircle size={18} /> Create Course
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/student" className={styles.link}>
                                    <LayoutDashboard size={18} /> My Learning
                                </Link>
                                <Link to="/courses" className={styles.link}>
                                    Browse
                                </Link>
                            </>
                        )}
                    </div>

                    <div className={styles.userSection}>
                        {user.role === 'student' && (
                            <Link to="/student/profile" className={styles.profileIconBtn} title="Profile">
                                <CircleUserRound size={18} />
                            </Link>
                        )}
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.roleBadge}>{user.role}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
