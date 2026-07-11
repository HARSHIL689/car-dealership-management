import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            const response = await loginApi(formData);

            login(response);

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
                setError("Unable to connect to server.");
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    );
}

export default Login;