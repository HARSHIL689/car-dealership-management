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

            <div className="navbar-left">

                {isAuthenticated && (
                    <Link to="/">
                        Dashboard
                    </Link>
                )}

                {user?.role === "ADMIN" && (
                    <Link to="/admin">
                        Admin
                    </Link>
                )}

            </div>

            <div className="navbar-right">

                {!isAuthenticated && (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

                {isAuthenticated && (
                    <>
                        <span>
                            Welcome, {user.fullName}
                        </span>

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;