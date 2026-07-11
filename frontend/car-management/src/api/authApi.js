import api from "./axios";

export const register = async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
};

export const login = async (loginData) => {
    const response = await api.post("/api/auth/login", loginData);
    return response.data;
};