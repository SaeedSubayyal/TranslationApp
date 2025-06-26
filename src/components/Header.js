import { styles } from '../styles/common';
import { NavLink } from './common/NavLink';
import { Button } from './common/Button';
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (e) {
            // Ignore errors
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    return (
        <header className="bg-[var(--header-bg)] py-3 shadow sticky top-0 z-50">
            <nav className={styles.container}>
                <div className={styles.flexBetween}>
                    <div className={`${styles.flexCenter} gap-3`}>
                        <img src="/assets/naomedical.png" alt="Logo" className="h-7" />
                        <span className="font-semibold"></span>
                    </div>
                    
                    <div className={`${styles.flexCenter} gap-5`}>
                        
                        <div className="flex gap-3">
                            {isLoggedIn ? (
                                <Button variant="secondary" onClick={handleLogout}>Log Out</Button>
                            ) : (
                                <>
                                    <Button variant="secondary" to="/login">Login</Button>
                                    <Button to="/signup">Sign Up</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};