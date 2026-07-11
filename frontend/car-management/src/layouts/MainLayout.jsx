import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "../styles/layout.css";

/**
 * MainLayout Component
 * Provides consistent page structure with navbar and footer
 * Wraps all authenticated pages with common layout elements
 */
function MainLayout({ children }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="app-layout">
            {/* Navigation Bar - Sticky at top */}
            <Navbar />

            {/* Main Content Area */}
            <main className="main-content">
                {/* Animated background decoration */}
                <div className="bg-decoration">
                    <div className="bg-circle bg-circle-1"></div>
                    <div className="bg-circle bg-circle-2"></div>
                    <div className="bg-circle bg-circle-3"></div>
                </div>

                {/* Page content with animation */}
                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            {/* Footer - Only shown when authenticated */}
            {isAuthenticated && (
                <footer className="app-footer">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4 className="footer-title">
                                <span className="footer-icon">🚗</span>
                                VehicleStore
                            </h4>
                            <p className="footer-description">
                                Your trusted destination for quality vehicles.
                                Browse, search, and purchase with confidence.
                            </p>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">Quick Links</h4>
                            <div className="footer-links">
                                <a href="/" className="footer-link">
                                    <span>🏠</span> Dashboard
                                </a>
                                {user?.role === "ADMIN" && (
                                    <a href="/admin" className="footer-link">
                                        <span>⚙️</span> Admin Panel
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-title">Account</h4>
                            <div className="footer-info">
                                <p className="footer-user">
                                    <span>👤</span> {user?.fullName || 'User'}
                                </p>
                                <p className="footer-role">
                                    <span>🔑</span> {user?.role || 'USER'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} VehicleStore. All rights reserved.</p>
                        <p className="footer-tagline">Made with ❤️ for quality vehicles</p>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default MainLayout;