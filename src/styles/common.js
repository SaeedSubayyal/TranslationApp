export const styles = {
    // Layout
    container: 'max-w-6xl mx-auto px-5',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
    flexCol: 'flex flex-col',
    
    // Typography
    heading1: 'text-4xl sm:text-2xl font-extrabold',
    heading2: 'text-3xl sm:text-xl font-semibold',
    textMuted: 'text-[var(--text-muted)]',
    gradientText: 'bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-green)] bg-clip-text text-transparent',
    
    // Components
    glassCard: 'glass-effect p-8 rounded-lg shadow',
    button: {
        primary: 'bg-[var(--accent-green)] text-[var(--primary-white)] px-5 py-2 rounded-full hover:shadow-lg transition-shadow',
        secondary: 'bg-[var(--glass-bg)] text-[var(--text-dark)] border border-[var(--glass-border)] px-5 py-2 rounded-full hover:shadow-lg'
    },
    
    // Navigation
    navLink: {
        active: 'text-[var(--accent-green)] font-semibold',
        default: 'text-[var(--text-dark)] hover:text-[var(--accent-blue)]'
    },
    
    // Layout sections
    section: {
        hero: 'relative flex items-center justify-center min-h-[calc(100vh-120px)] text-center overflow-hidden',
        content: 'text-center py-10'
    }
}; 