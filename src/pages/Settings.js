import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Settings = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    // Load user data from localStorage on component mount
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('You must be logged in to access settings');
            navigate('/login');
            return;
        }
        
        if (userData) {
            setName(userData.name || '');
            setEmail(userData.email || '');
        }
    }, [navigate]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateName = (name) => /^[A-Za-z0-9 ]+$/.test(name);

    const handleUpdate = async () => {
        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!validateName(name)) {
            alert('Name cannot contain special characters.');
            return;
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to update your account.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/update`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Account updated!');
                
                // Update local storage with new user data if name or email changed
                if (name || email) {
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = {
                        ...userData,
                        name: name || userData.name,
                        email: email || userData.email
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (e) {
            console.error('Update error:', e);
            alert('Update failed');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--primary-white)] font-serif text-[var(--text-dark)]">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="md:ml-64 p-5 flex-1">
                    <h1 className="text-2xl font-bold mb-5">Settings</h1>
                    <div className="max-w-lg sm:max-w-full">
                        <h2 className="text-xl font-semibold mb-3">Account</h2>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" placeholder="Your Name" />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" placeholder="Your Email" />
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none" placeholder="Your Password" />
                        </div>
                        <button onClick={handleUpdate} className="bg-[var(--accent-blue)] text-[var(--primary-white)] px-5 py-2 rounded hover:bg-blue-600">Update Account</button>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};