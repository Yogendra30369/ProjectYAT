import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { GraduationCap, AlertCircle } from 'lucide-react';
import styles from './Login.module.css';

export const StudentLogin = () => {
    const { loginWithCredentials } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = loginWithCredentials(email, password);
        
        if (result.success && result.user.role === 'student') {
            navigate('/student');
        } else if (result.success && result.user.role !== 'student') {
            setError('This account is not a student account');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoIcon}>
                        <GraduationCap size={24} color="white" />
                    </div>
                    <h1 className={styles.title}>Student Portal</h1>
                    <p className={styles.subtitle}>Sign in to start learning</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="student@course.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '0.75rem', 
                            background: 'var(--error-50)', 
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--error-700)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* Sample Credentials */}
                <div style={{ 
                    marginTop: '1rem',
                    padding: '1rem', 
                    background: 'var(--primary-50)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--primary-200)'
                }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
                        📋 Sample Credentials
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--primary-700)' }}>
                        <div><strong>Email:</strong> student@course.com</div>
                        <div><strong>Password:</strong> student123</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Don't have an account?{' '}
                        <Link to="/student/signup" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: '500' }}>
                            Sign up
                        </Link>
                    </div>
                    <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontSize: '0.875rem' }}>
                        ← Back to login selection
                    </Link>
                </div>
            </Card>
        </div>
    );
};
