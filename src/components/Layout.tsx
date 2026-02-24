import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import NotificationController from "./NotificationController";

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <NotificationController />
            {/* Navigation Bar (NavBar) */}
            <Navbar />
            
            {/* Main Content Area */}
            <main className="grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-bg-main text-txt-muted text-center p-4 text-sm border-t border-white/10">
                © 2025 Excalix Code. All rights reserved.
            </footer>
        </div>
    )
}

export default Layout;