import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="navbar-brand-icon">🚗</span>
                    <span className="navbar-brand-text">VehicleStore</span>
                </Link>

                {isAuthenticated && (
                    <div className="navbar-links">
                        <Link 
                            to="/" 
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🏠</span>
                            <span>Dashboard</span>
                        </Link>

                        {user?.role === "ADMIN" && (
                            <Link 
                                to="/admin" 
                                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                            >
                                <span className="nav-icon">⚙️</span>
                                <span>Admin Panel</span>
                            </Link>
                        )}
                    </div>
                )}

                <div className="navbar-auth">
                    {!isAuthenticated ? (
                        <div className="auth-buttons">
                            <Link to="/login" className="nav-btn login-btn">
                                <span>🔑</span>
                                <span>Login</span>
                            </Link>
                            <Link to="/register" className="nav-btn register-btn">
                                <span>✨</span>
                                <span>Register</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="user-info">
                            <div className="user-avatar">
                                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="user-details">
                                <span className="welcome-text">
                                    {user.fullName}
                                </span>
                                <span className="user-email">
                                    {user.email}
                                </span>
                            </div>
                            <span className="role-badge">
                                {user.role}
                            </span>
                            <button 
                                onClick={handleLogout} 
                                className="logout-btn"
                                title="Logout"
                            >
                                <span>🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;