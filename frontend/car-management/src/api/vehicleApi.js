import api from "./axios";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getVehicles = async (includeOutOfStock = false) => {
    const response = await api.get(
        `/api/vehicles?includeOutOfStock=${includeOutOfStock}`,
        getAuthHeader()
    );
    return response.data;
};

export const searchVehicles = async (params) => {
    const response = await api.get("/api/vehicles/search", {
        ...getAuthHeader(),
        params,
    });
    return response.data;
};

export const addVehicle = async (vehicle) => {
    const response = await api.post(
        "/api/vehicles",
        vehicle,
        getAuthHeader()
    );
    return response.data;
};

export const updateVehicle = async (id, vehicle) => {
    const response = await api.put(
        `/api/vehicles/${id}`,
        vehicle,
        getAuthHeader()
    );
    return response.data;
};

export const deleteVehicle = async (id) => {
    await api.delete(`/api/vehicles/${id}`, getAuthHeader());
};

export const purchaseVehicle = async (id, quantity = 1) => {
    // Ensure quantity is always sent as a number
    const payload = {
        quantity: Number(quantity)
    };
    
    console.log("Sending purchase request:", { id, payload }); // Debug log
    
    const response = await api.post(
        `/api/vehicles/${id}/purchase`,
        payload,
        getAuthHeader()
    );
    
    console.log("Purchase response:", response.data); // Debug log
    
    return response.data;
};

export const restockVehicle = async (id, quantity) => {
    const payload = {
        quantity: Number(quantity)
    };
    
    const response = await api.post(
        `/api/vehicles/${id}/restock`,
        payload,
        getAuthHeader()
    );
    return response.data;
};