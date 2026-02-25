import React from 'react';
import styles from './Card.module.css';
import { clsx } from 'clsx';

export const Card = ({ children, className, hoverable = false, ...props }) => {
    return (
        <div
            className={clsx(styles.card, hoverable && styles.hoverable, className)}
            {...props}
        >
            {children}
        </div>
    );
};
