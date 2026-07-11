import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    Vehicle Store
                </Link>
            </div>

            <div className="navbar-links">
                {isAuthenticated && (
                    <Link to="/" className="nav-link">
                        Dashboard
                    </Link>
                )}

                {isAuthenticated && user?.role === "ADMIN" && (
                    <Link to="/admin" className="nav-link">
                        Admin Panel
                    </Link>
                )}
            </div>

            <div className="navbar-auth">
                {!isAuthenticated ? (
                    <>
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                        <Link to="/register" className="nav-link">
                            Register
                        </Link>
                    </>
                ) : (
                    <div className="user-info">
                        <span className="welcome-text">
                            Welcome, {user.fullName}
                        </span>
                        <span className="role-badge">{user.role}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;