import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-[var(--header-bg)] p-5 fixed h-full shadow md:block hidden">
            <div className="flex items-center gap-3 mb-8">
                <span className="font-semibold">Healthcare Translation</span>
            </div>
            <ul className="flex flex-col gap-3 list-none">
                <li><NavLink to="/translate" className={({ isActive }) => isActive ? "block p-3 bg-[var(--accent-green)] text-[var(--primary-white)] rounded" : "block p-3 text-[var(--text-dark)] hover:bg-gray-200 rounded"}>Translate</NavLink></li>
                <li><NavLink to="/history" className={({ isActive }) => isActive ? "block p-3 bg-[var(--accent-green)] text-[var(--primary-white)] rounded" : "block p-3 text-[var(--text-dark)] hover:bg-gray-200 rounded"}>History</NavLink></li>
                <li><NavLink to="/settings" className={({ isActive }) => isActive ? "block p-3 bg-[var(--accent-green)] text-[var(--primary-white)] rounded" : "block p-3 text-[var(--text-dark)] hover:bg-gray-200 rounded"}>Settings</NavLink></li>
            </ul>
        </aside>
    );
};