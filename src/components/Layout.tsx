import React from "react";
import { Outlet, Link } from "react-router-dom";
import Navbar from "./NavBar";

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation Bar (NavBar) */}
            <Navbar />
            
            {/* Main Content Area */}
            {/* <Outlet /> is a placeholder. React Router replaces this with the page we are currently on. */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-bg-card text-txt-muted text-center p-4 text-sm  border-t border-white/10">
                © 2025 Excalix Code. All rights reserved.
            </footer>
        </div>
    )
}

export default Layout;