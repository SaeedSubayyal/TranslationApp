import { Link } from 'react-router-dom';

export const AuthModal = ({ type, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
            <div className="bg-[var(--primary-white)] p-8 rounded-lg shadow max-w-sm w-[90%] relative">
                <button onClick={onClose} className="absolute top-3 right-4 text-[var(--text-dark)] text-xl hover:text-[var(--accent-green)]">×</button>
                <div className="flex border-b border-[var(--glass-border)] mb-5">
                    <Link to="/login" className={`flex-1 py-2 text-center font-semibold ${type === 'login' ? 'border-b-2 border-[var(--accent-green)] text-[var(--accent-green)]' : ''}`}>Login</Link>
                    <Link to="/signup" className={`flex-1 py-2 text-center font-semibold ${type === 'signup' ? 'border-b-2 border-[var(--accent-green)] text-[var(--accent-green)]' : ''}`}>Sign Up</Link>
                </div>
                {type === 'login' ? (
                    <>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Email</label>
                            <input type="email" className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Password</label>
                            <input type="password" className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" />
                        </div>
                        <button className="w-full bg-[var(--accent-green)] text-[var(--primary-white)] px-5 py-2 rounded-full hover:shadow-lg">Login</button>
                    </>
                ) : (
                    <>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Full Name</label>
                            <input type="text" className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Email</label>
                            <input type="email" className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Password</label>
                            <input type="password" className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Medical Specialty</label>
                            <input type="text" className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" />
                        </div>
                        <button className="w-full bg-[var(--accent-green)] text-[var(--primary-white)] px-5 py-2 rounded-full hover:shadow-lg">Sign Up</button>
                    </>
                )}
            </div>
        </div>
    );
};