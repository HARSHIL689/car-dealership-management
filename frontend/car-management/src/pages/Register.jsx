import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import "../styles/auth.css";

function Register() {
    const navigate = useNavigate();

    // State for form inputs
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "USER", // Always USER, role selection removed
    });

    // State for messages
    const [message, setMessage] = useState("");
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
        
        // Clear messages when user starts typing
        if (error) setError("");
        if (message) setMessage("");
    };

    /**
     * Handle form submission
     * Validates inputs and calls register API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setIsLoading(true);

        try {
            const response = await register(formData);
            
            setMessage(response.message || "Registration successful!");
            
            // Redirect to login page after success
            setTimeout(() => {
                navigate("/login");
            }, 1500);
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
                setError("Something went wrong. Please try again.");
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
                    <div className="auth-icon">✨</div>
                    <h2>Create Account</h2>
                    <p>Join us and start exploring vehicles</p>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="auth-message success">
                        <span className="message-icon">✅</span>
                        <span>{message}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="auth-message error">
                        <span className="message-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="fullName">
                            <span className="label-icon">👤</span>
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                            disabled={isLoading}
                        />
                    </div>

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
                            placeholder="Create a password (min. 8 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
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
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>✨</span>
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;