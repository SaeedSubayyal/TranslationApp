import { Link } from 'react-router-dom';
import { styles } from '../../styles/common';

export const Button = ({ 
    children, 
    variant = 'primary', 
    to, 
    href, 
    className = '', 
    ...props 
}) => {
    const buttonClasses = `${styles.button[variant]} ${className}`;
    
    if (to) {
        return (
            <Link to={to} className={buttonClasses} {...props}>
                {children}
            </Link>
        );
    }
    
    if (href) {
        return (
            <a href={href} className={buttonClasses} {...props}>
                {children}
            </a>
        );
    }
    
    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
}; 