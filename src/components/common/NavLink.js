import { NavLink as RouterNavLink } from 'react-router-dom';
import { styles } from '../../styles/common';

export const NavLink = ({ to, children, className = '' }) => {
    return (
        <RouterNavLink 
            to={to} 
            className={({ isActive }) => 
                `${isActive ? styles.navLink.active : styles.navLink.default} ${className}`
            }
        >
            {children}
        </RouterNavLink>
    );
}; 