import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import styles from './Login.module.css';

export const Login = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoIcon}>
                        <BookOpen size={24} className={styles.logoSymbol} />
                    </div>
                    <h1 className={styles.title}>Welcome to CourseMinds</h1>
                    <p className={styles.subtitle}>Choose your portal to continue</p>
                </div>

                <div className={styles.options}>
                    <button className={styles.roleBtn} onClick={() => navigate('/educator/login')}>
                        <Briefcase size={32} className={styles.icon} />
                        <div className={styles.text}>
                            <span className={styles.roleTitle}>Educator</span>
                            <span className={styles.roleDesc}>Create & manage courses</span>
                        </div>
                    </button>

                    <button className={styles.roleBtn} onClick={() => navigate('/student/login')}>
                        <GraduationCap size={32} className={styles.icon} />
                        <div className={styles.text}>
                            <span className={styles.roleTitle}>Student</span>
                            <span className={styles.roleDesc}>Start learning today</span>
                        </div>
                    </button>
                </div>

                <div className={styles.footerText}>
                    New student?{' '}
                    <button 
                        onClick={() => navigate('/student/signup')}
                        className={styles.footerLink}
                    >
                        Create an account
                    </button>
                </div>
            </Card>
        </div>
    );
};
