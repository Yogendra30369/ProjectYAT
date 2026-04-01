import React from 'react';
import styles from './Input.module.css';
import { clsx } from 'clsx';

export const Input = ({ label, error, className, ...props }) => {
    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                className={clsx(styles.input, error && styles.error, className)}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
