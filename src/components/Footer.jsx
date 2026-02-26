import React from 'react';
import styles from './Footer.module.css';
import { Linkedin, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const aboutLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Contact Us', to: '/contact' }
];
const supportLinks = ['Help Center', 'FAQs'];
const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/' },
    { name: 'Twitter', icon: Twitter, url: 'https://x.com/' }
];

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                <div className={styles.topGrid}>
                    <div>
                        <h3 className={styles.sectionTitle}>About CourseMinds</h3>
                        <ul className={styles.linkList}>
                            {aboutLinks.map((link) => (
                                <li key={link.label}>
                                    {link.to === '#' ? (
                                        <a href="#" className={styles.footerLink}>{link.label}</a>
                                    ) : (
                                        <Link to={link.to} className={styles.footerLink}>{link.label}</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Support</h3>
                        <ul className={styles.linkList}>
                            {supportLinks.map((link) => (
                                <li key={link}>
                                    <a href="#" className={styles.footerLink}>{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className={styles.sectionTitle}>Connect</h3>
                        <div className={styles.socialRow}>
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.socialIconLink}
                                        aria-label={social.name}
                                        title={social.name}
                                    >
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className={styles.bottomRow}>
                    <p>© 2026 CourseMinds. All rights reserved.</p>
                    <p>Cookie Settings | English</p>
                </div>
            </div>
        </footer>
    );
};