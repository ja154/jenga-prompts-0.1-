import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md ${isActive ? 'bg-sidebar-accent' : ''}`;

    return (
        <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 space-y-4 border-r border-sidebar-border">
            <nav>
                <ul>
                    <li className="mb-2">
                        <NavLink to="/" className={navLinkClasses}>
                            <i className="fas fa-home w-6 text-center mr-3"></i>
                            <span>Home</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink to="/profile" className={navLinkClasses}>
                            <i className="fas fa-user-circle w-6 text-center mr-3"></i>
                            <span>Profile</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink to="/settings" className={navLinkClasses}>
                            <i className="fas fa-cog w-6 text-center mr-3"></i>
                            <span>Settings</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink to="/history" className={navLinkClasses}>
                            <i className="fas fa-history w-6 text-center mr-3"></i>
                            <span>History</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink to="/login" className={navLinkClasses}>
                            <i className="fas fa-sign-in-alt w-6 text-center mr-3"></i>
                            <span>Login</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
