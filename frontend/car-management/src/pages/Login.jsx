import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // State for form inputs
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // State for error messages
    const [error, setError] = useState("");
    // State for loading
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle input changes for form fields
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        
        // Clear error when user starts typing
        if (error) setError("");
    };

    /**
     * Handle form submission
     * Validates inputs and calls login API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await loginApi(formData);
            
            // Store user data in context
            login(response);
            
            // Redirect to dashboard
            navigate("/");
        } catch (err) {
            if (err.response) {
                if (err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.response.data.fieldErrors) {
                    const errors = Object.values(
                        err.response.data.fieldErrors
                    );
                    setError(errors.join(", "));
                }
            } else {
                setError("Unable to connect to server. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Header Section */}
                <div className="auth-header">
                    <div className="auth-icon">🔐</div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account to continue</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="auth-message error">
                        <span className="message-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">
                            <span className="label-icon">📧</span>
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <span className="label-icon">🔒</span>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="button-spinner"></span>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>🚀</span>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;