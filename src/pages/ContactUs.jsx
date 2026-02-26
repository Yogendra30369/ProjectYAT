import React from 'react';
import { Card } from '../components/Card';

export const ContactUs = () => {
    return (
        <div className="container" style={{ maxWidth: '960px', marginTop: '2rem' }}>
            <Card>
                <h1 style={{ marginBottom: '1rem' }}>Contact Us</h1>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem' }}>Contact Information</h2>

                <div style={{ display: 'grid', gap: '0.7rem', color: 'var(--gray-700)', fontSize: '1rem' }}>
                    <p style={{ margin: 0 }}>📧 Email: support@courseminds.com</p>
                    <p style={{ margin: 0 }}>📞 Phone: +91 XXXXX XXXXX</p>
                    <p style={{ margin: 0 }}>📍 Location: KLU University, Andhra Pradesh, India</p>
                </div>
            </Card>
        </div>
    );
};
