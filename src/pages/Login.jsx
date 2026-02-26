import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, GraduationCap, Briefcase, ArrowLeft } from 'lucide-react';
import styles from './Login.module.css';

export const Login = () => {
    const { login, registerStudent } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [studentMode, setStudentMode] = useState('login');
    const [formData, setFormData] = useState({
        roleEmail: '',
        rolePassword: '',
        name: '',
        signupEmail: '',
        signupPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStudentMode('login');
        setErrors({});
        setFormData((prev) => ({
            ...prev,
            roleEmail: '',
            rolePassword: ''
        }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateRoleLogin = () => {
        const nextErrors = {};

        if (!formData.roleEmail.trim()) {
            nextErrors.roleEmail = 'Email is required';
        }

        if (!formData.rolePassword.trim()) {
            nextErrors.rolePassword = 'Password is required';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handlePortalLogin = (event) => {
        event.preventDefault();

        if (!validateRoleLogin()) {
            return;
        }

        login(selectedRole, formData.roleEmail.trim());
        navigate(selectedRole === 'educator' ? '/educator' : '/student');
    };

    const handleRegister = (event) => {
        event.preventDefault();

        const nextErrors = {};

        if (!formData.name.trim()) {
            nextErrors.name = 'Name is required';
        }

        if (!formData.signupEmail.trim()) {
            nextErrors.signupEmail = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.signupEmail)) {
            nextErrors.signupEmail = 'Enter a valid email address';
        }

        if (!formData.signupPassword.trim()) {
            nextErrors.signupPassword = 'Password is required';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        registerStudent({
            name: formData.name.trim(),
            email: formData.signupEmail.trim(),
            password: formData.signupPassword
        });

        navigate('/student');
    };

    const isStudentPortal = selectedRole === 'student';
    const isStudentSignup = isStudentPortal && studentMode === 'signup';

    const icon = selectedRole === 'educator' ? <Briefcase size={20} color="white" /> : <GraduationCap size={20} color="white" />;
    const title = selectedRole === 'educator' ? 'Educator Portal' : 'Student Portal';
    const subtitle = selectedRole === 'educator'
        ? 'Sign in to manage your courses'
        : 'Sign in to start learning';

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                {!selectedRole ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.logoIcon}>
                                <BookOpen size={24} color="white" />
                            </div>
                            <h1 className={styles.title}>Welcome back to CourseMinds</h1>
                            <p className={styles.subtitle}>Choose your portal to continue</p>
                        </div>

                        <div className={styles.options}>
                            <button className={styles.roleBtn} onClick={() => handleRoleSelect('educator')}>
                                <Briefcase size={32} className={styles.icon} />
                                <div className={styles.text}>
                                    <span className={styles.roleTitle}>Educator Portal</span>
                                    <span className={styles.roleDesc}>Create & manage courses</span>
                                </div>
                            </button>

                            <button className={styles.roleBtn} onClick={() => handleRoleSelect('student')}>
                                <GraduationCap size={32} className={styles.icon} />
                                <div className={styles.text}>
                                    <span className={styles.roleTitle}>Student Portal</span>
                                    <span className={styles.roleDesc}>Start learning today</span>
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.options}>
                        <div className={styles.portalHeader}>
                            <div className={styles.logoIcon}>
                                {icon}
                            </div>
                            <h2 className={styles.portalTitle}>{title}</h2>
                            <p className={styles.portalSubtitle}>{subtitle}</p>
                        </div>

                        {!isStudentSignup ? (
                            <form className={styles.registerForm} onSubmit={handlePortalLogin}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Email</label>
                                    <input
                                        className={styles.fieldInput}
                                        name="roleEmail"
                                        type="email"
                                        placeholder={selectedRole === 'educator' ? 'educator@course.com' : 'student@course.com'}
                                        value={formData.roleEmail}
                                        onChange={handleChange}
                                    />
                                    {errors.roleEmail && <span className={styles.errorText}>{errors.roleEmail}</span>}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Password</label>
                                    <input
                                        className={styles.fieldInput}
                                        name="rolePassword"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.rolePassword}
                                        onChange={handleChange}
                                    />
                                    {errors.rolePassword && <span className={styles.errorText}>{errors.rolePassword}</span>}
                                </div>

                                <Button type="submit" className={styles.fullWidthButton}>
                                    Sign In
                                </Button>

                                <div className={styles.credentialsBox}>
                                    <p className={styles.credentialsTitle}>Sample Credentials</p>
                                    <p className={styles.credentialsText}>
                                        <strong>Email:</strong> {selectedRole === 'educator' ? 'educator@course.com' : 'student@course.com'}
                                    </p>
                                    <p className={styles.credentialsText}>
                                        <strong>Password:</strong> {selectedRole === 'educator' ? 'educator123' : 'student123'}
                                    </p>
                                </div>

                                {isStudentPortal && (
                                    <p className={styles.switchText}>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            type="button"
                                            className={styles.textLink}
                                            onClick={() => {
                                                setStudentMode('signup');
                                                setErrors({});
                                            }}
                                        >
                                            Sign up
                                        </button>
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={() => {
                                        setSelectedRole(null);
                                        setStudentMode('login');
                                        setErrors({});
                                    }}
                                >
                                    <ArrowLeft size={14} />
                                    Back to login selection
                                </button>
                            </form>
                        ) : (
                            <form className={styles.registerForm} onSubmit={handleRegister}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Full Name</label>
                                    <input
                                        className={styles.fieldInput}
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Email</label>
                                    <input
                                        className={styles.fieldInput}
                                        name="signupEmail"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.signupEmail}
                                        onChange={handleChange}
                                    />
                                    {errors.signupEmail && <span className={styles.errorText}>{errors.signupEmail}</span>}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Password</label>
                                    <input
                                        className={styles.fieldInput}
                                        name="signupPassword"
                                        type="password"
                                        placeholder="Create password"
                                        value={formData.signupPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.signupPassword && <span className={styles.errorText}>{errors.signupPassword}</span>}
                                </div>

                                <Button type="submit" className={styles.fullWidthButton}>
                                    Sign Up
                                </Button>

                                <p className={styles.switchText}>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        className={styles.textLink}
                                        onClick={() => {
                                            setStudentMode('login');
                                            setErrors({});
                                        }}
                                    >
                                        Sign in
                                    </button>
                                </p>

                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={() => {
                                        setSelectedRole(null);
                                        setStudentMode('login');
                                        setErrors({});
                                    }}
                                >
                                    <ArrowLeft size={14} />
                                    Back to login selection
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};
