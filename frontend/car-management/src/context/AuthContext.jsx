import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const getStoredUser = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    return {
        token,
        userId: localStorage.getItem("userId"),
        fullName: localStorage.getItem("fullName"),
        email: localStorage.getItem("email"),
        role: localStorage.getItem("role"),
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);

    const login = (loginResponse) => {
        const loggedInUser = {
            token: loginResponse.token,
            userId: loginResponse.userId,
            fullName: loginResponse.fullName,
            email: loginResponse.email,
            role: loginResponse.role,
        };

        localStorage.setItem("token", loggedInUser.token);
        localStorage.setItem("userId", loggedInUser.userId);
        localStorage.setItem("fullName", loggedInUser.fullName);
        localStorage.setItem("email", loggedInUser.email);
        localStorage.setItem("role", loggedInUser.role);

        setUser(loggedInUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

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