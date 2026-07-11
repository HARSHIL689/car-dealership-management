import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Create authentication context
const AuthContext = createContext();

/**
 * Retrieve stored user data from localStorage
 * Returns null if no valid session exists
 */
const getStoredUser = () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return null;

        return {
            token,
            userId: localStorage.getItem("userId"),
            fullName: localStorage.getItem("fullName"),
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
        };
    } catch (error) {
        console.error("Error reading user data from localStorage:", error);
        // Clear potentially corrupted data
        localStorage.clear();
        return null;
    }
};

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth methods to children
 */
export const AuthProvider = ({ children }) => {
    // Initialize user state from stored session
    const [user, setUser] = useState(getStoredUser);
    // Track loading state for initial auth check
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check for existing session on mount
     * Validates stored token and sets loading state
     */
    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    /**
     * Login handler
     * Stores user data in localStorage and updates state
     * @param {Object} loginResponse - Response from login API
     */
    const login = useCallback((loginResponse) => {
        try {
            // Validate login response
            if (!loginResponse || !loginResponse.token) {
                console.error("Invalid login response");
                return;
            }

            // Create user object from login response
            const loggedInUser = {
                token: loginResponse.token,
                userId: loginResponse.userId,
                fullName: loginResponse.fullName,
                email: loginResponse.email,
                role: loginResponse.role,
            };

            // Persist user data to localStorage
            localStorage.setItem("token", loggedInUser.token);
            localStorage.setItem("userId", loggedInUser.userId);
            localStorage.setItem("fullName", loggedInUser.fullName);
            localStorage.setItem("email", loggedInUser.email);
            localStorage.setItem("role", loggedInUser.role);

            // Update application state
            setUser(loggedInUser);
        } catch (error) {
            console.error("Error during login:", error);
        }
    }, []);

    /**
     * Logout handler
     * Clears user data from localStorage and resets state
     */
    const logout = useCallback(() => {
        try {
            // Clear all authentication data from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("fullName");
            localStorage.removeItem("email");
            localStorage.removeItem("role");

            // Reset user state
            setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }, []);

    /**
     * Update user profile information
     * @param {Object} updatedUserData - New user data to update
     */
    const updateUser = useCallback((updatedUserData) => {
        try {
            const updatedUser = {
                ...user,
                ...updatedUserData,
            };

            // Update localStorage
            if (updatedUserData.fullName) {
                localStorage.setItem("fullName", updatedUserData.fullName);
            }
            if (updatedUserData.email) {
                localStorage.setItem("email", updatedUserData.email);
            }
            if (updatedUserData.role) {
                localStorage.setItem("role", updatedUserData.role);
            }

            // Update state
            setUser(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }, [user]);

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean}
     */
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    const isAdmin = useCallback(() => {
        return user?.role === "ADMIN";
    }, [user]);

    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Provide authentication context to children
    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                updateUser,
                hasRole,
                isAdmin,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    
    return context;
};

export default AuthContext;