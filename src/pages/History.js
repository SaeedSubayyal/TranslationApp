import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const History = () => {
    const [history, setHistory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/history`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    setHistory(data);
                }
            })
            .catch((err) => {
                console.error('Error fetching history:', err);
                alert('Failed to load history. Please try again.');
            });
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[var(--primary-white)] font-serif text-[var(--text-dark)]">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="md:ml-64 p-5 flex-1">
                    <h1 className="text-2xl font-bold mb-5">Chat History</h1>
                    <p className="text-[var(--text-muted)] mb-5">Review your past translation sessions.</p>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[var(--glass-bg)] text-[var(--text-muted)]">
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Summary</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item.id} className="border-b border-[var(--glass-border)]">
                                    <td className="p-3">{new Date(item.date).toLocaleString()}</td>
                                    <td className="p-3">{item.original_text.substring(0, 50)}{item.original_text.length > 50 ? '...' : ''} → {item.translated_text.substring(0, 50)}{item.translated_text.length > 50 ? '...' : ''}</td>
                                    <td className="p-3">
                                        <button 
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowModal(true);
                                            }} 
                                            className="text-[var(--accent-blue)] hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            </div>
            <Footer />
            
            {/* Detail Modal */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[var(--text-dark)]">Conversation Details</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-6 p-4 bg-[var(--glass-bg)] rounded-lg">
                            <h3 className="text-md font-semibold text-[var(--text-dark)] mb-2">Date and Time</h3>
                            <p className="text-sm text-[var(--text-muted)] mb-1">{selectedItem.date}</p>
                            <p className="font-medium text-lg">{new Date(selectedItem.date).toLocaleString()}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-4 bg-[var(--glass-bg)] rounded-lg">
                                <h3 className="text-md font-semibold text-[var(--text-dark)] mb-2">
                                    Original Text
                                    <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                                        ({selectedItem.output_language || 'en'})
                                    </span>
                                </h3>
                                <div className="p-4 bg-white rounded-lg border border-[var(--glass-border)]">
                                    <p className="whitespace-pre-wrap">{selectedItem.translated_text}</p>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-[var(--glass-bg)] rounded-lg">
                                <h3 className="text-md font-semibold text-[var(--text-dark)] mb-2">
                                    Translated Text
                                    <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                                        ({selectedItem.input_language || 'Unknown language'})
                                    </span>
                                </h3>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-[var(--accent-blue)] text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};