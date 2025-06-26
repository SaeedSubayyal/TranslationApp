export const Footer = () => {
    return (
        <footer className="bg-[var(--footer-bg)] text-[var(--primary-white)] text-center py-5 mt-auto">
            <div className="max-w-6xl mx-auto px-5">
                <img src="/assets/naomedical.png" alt="Footer Logo" className="h-7 mx-auto mb-2" />
                <div className="flex justify-center gap-4 mb-2">
                    <a href="#"><img src="/assets/facebook-icon.png" alt="Facebook" className="h-6 hover:scale-110" /></a>
                    <a href="#"><img src="/assets/twitter-icon.png" alt="Twitter" className="h-6 hover:scale-110" /></a>
                    <a href="#"><img src="/assets/linkedin-icon.png" alt="LinkedIn" className="h-6 hover:scale-110" /></a>
                </div>
                <p className="text-sm">Need assistance? Contact us at support@healthcaretranslation.com or (917) 633-1548 Ext 288.</p>
                <a href="#" className="text-[var(--primary-white)] text-sm hover:underline">Contact Us</a>
            </div>
        </footer>
    );
};