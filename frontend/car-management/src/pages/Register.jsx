import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "USER",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await register(formData);

            setMessage(response.message);

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
                setError("Something went wrong.");
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                />

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

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>

                <button type="submit">
                    Register
                </button>

            </form>
        </div>
    );
}

export default Register;