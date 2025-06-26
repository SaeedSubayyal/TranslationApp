import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/common/Button';
import { styles } from '../styles/common';

export const Home = () => {
    return (
        <div className={`${styles.flexCol} min-h-screen bg-[var(--primary-white)] text-[var(--text-dark)]`}>
            <Header />
            <div className="flex-1">
                <section className={styles.section.hero}>
                    <div className="absolute inset-0 w-full h-full">
                        <img 
                            src="/assets/hero-image.png" 
                            alt="Hero" 
                            className="w-full h-full object-cover"
                            style={{ filter: 'brightness(0.8)' }}
                        />
                    </div>
                    <div className={`${styles.glassCard} relative z-10 max-w-xl mx-auto sm:max-w-[90%]`}>
                        <h1 className={`${styles.heading1} ${styles.gradientText} mb-5`}>
                            Healthcare Translation
                        </h1>
                        <p className={`${styles.textMuted} mb-5 max-w-md mx-auto`}>
                            Secure, HIPAA-compliant medical translation platform with real-time database synchronization and comprehensive history tracking.
                        </p>
                        <Button href="/signup">Get Started</Button>
                    </div>
                </section>

                <div className="h-5 bg-[var(--primary-white)]" />
                
                <section className={styles.section.content}>
                    <h2 className={`${styles.heading2} ${styles.gradientText} mb-10`}>
                        Locations in New York
                    </h2>
                    <img 
                        src="/assets/map-image.png" 
                        alt="Map" 
                        className="max-w-[80%] sm:max-w-[90%] h-auto mx-auto border-2 border-[var(--primary-white)] rounded-lg shadow" 
                    />
                </section>
            </div>
            <Footer />
        </div>
    );
};