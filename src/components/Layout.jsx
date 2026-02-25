import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, paddingBottom: '4rem' }}>
                {children}
            </main>
        </div>
    );
};
