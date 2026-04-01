import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './Login.module.css';

export const StudentSignup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = signup(formData.name, formData.email, formData.password);
        
        if (result.success) {
            navigate('/student');
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
                    <h1 className={styles.title}>Create Student Account</h1>
                    <p className={styles.subtitle}>Start your learning journey today</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                            Full Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                            Confirm Password
                        </label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                {/* Info box */}
                <div style={{ 
                    marginTop: '1rem',
                    padding: '1rem', 
                    background: 'var(--success-50)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--success-200)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} />
                        <span>Free access to all courses after signup!</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Already have an account?{' '}
                        <Link to="/student/login" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: '500' }}>
                            Sign in
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
