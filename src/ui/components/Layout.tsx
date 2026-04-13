import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import NotificationController from "./NotificationController";
import Footer from "./Footer";

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
            <Footer />
        </div>
    )
}

export default Layout;