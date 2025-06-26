import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user data and token
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.access_token);
                setMessage('Login successful!');
                setTimeout(() => navigate('/translate'), 1000);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('OTP verified successfully!');
                setShowOtp(false);
                setOtp('');
            } else {
                setError(data.error || 'OTP verification failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('OTP sent successfully!');
                console.log('New OTP:', data.otp); // Remove in production
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--primary-white)] font-serif text-[var(--text-dark)]">
            <Header />
            <div className="flex-1 flex items-center justify-center p-5">
                <div className="max-w-md w-full">
                    <div className="bg-white p-8 rounded-lg shadow-lg border border-[var(--glass-border)]">
                        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                        
                        {message && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                                {message}
                            </div>
                        )}
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        {!showOtp ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[var(--accent-blue)] text-[var(--primary-white)] py-3 rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleOtpVerification} className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium">OTP Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-3 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[var(--accent-blue)] text-[var(--primary-white)] py-3 rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                                >
                                    Resend OTP
                                </button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-[var(--text-muted)]">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-[var(--accent-blue)] hover:underline"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};