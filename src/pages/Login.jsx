import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import styles from './Login.module.css';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        login(role);
        navigate(role === 'educator' ? '/educator' : '/student');
    };

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoIcon}>
                        <BookOpen size={24} color="white" />
                    </div>
                    <h1 className={styles.title}>Welcome back to CourseMinds</h1>
                    <p className={styles.subtitle}>Choose your portal to continue</p>
                </div>

                <div className={styles.options}>
                    <button className={styles.roleBtn} onClick={() => handleLogin('educator')}>
                        <Briefcase size={32} className={styles.icon} />
                        <div className={styles.text}>
                            <span className={styles.roleTitle}>Educator</span>
                            <span className={styles.roleDesc}>Create & manage courses</span>
                        </div>
                    </button>

                    <button className={styles.roleBtn} onClick={() => handleLogin('student')}>
                        <GraduationCap size={32} className={styles.icon} />
                        <div className={styles.text}>
                            <span className={styles.roleTitle}>Student</span>
                            <span className={styles.roleDesc}>Start learning today</span>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
};
