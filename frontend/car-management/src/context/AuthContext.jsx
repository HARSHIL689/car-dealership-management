import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        const storedUser = {
            token,
            userId: localStorage.getItem("userId"),
            fullName: localStorage.getItem("fullName"),
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
        };

        setUser(storedUser);
    }, []);

    const login = (loginResponse) => {
        localStorage.setItem("token", loginResponse.token);
        localStorage.setItem("userId", loginResponse.userId);
        localStorage.setItem("fullName", loginResponse.fullName);
        localStorage.setItem("email", loginResponse.email);
        localStorage.setItem("role", loginResponse.role);

        setUser(loginResponse);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);