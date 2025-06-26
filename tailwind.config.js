module.exports = {
    content: ['./src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                'primary-white': 'var(--primary-white)',
                'accent-blue': 'var(--accent-blue)',
                'accent-green': 'var(--accent-green)',
                'text-dark': 'var(--text-dark)',
                'text-muted': 'var(--text-muted)',
                'header-bg': 'var(--header-bg)',
                'glass-bg': 'var(--glass-bg)',
                'glass-border': 'var(--glass-border)',
                'footer-bg': 'var(--footer-bg)',
            },
            fontFamily: {
                serif: ['Times New Roman', 'Times', 'serif'],
            }
        }
    },
    plugins: []
};