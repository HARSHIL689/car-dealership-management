import { useEffect, useState, useCallback, useRef } from "react";
import { getVehicles, searchVehicles } from "../api/vehicleApi";
import VehicleCard from "../components/VehicleCard";
import SearchBar from "../components/SearchBar";

function Dashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [purchasingVehicles, setPurchasingVehicles] = useState({});
    const vehicleOrderRef = useRef([]);

    const loadVehicles = useCallback(async () => {
        try {
            const data = await getVehicles(true);
            
            // If this is the first load, save the order
            if (vehicleOrderRef.current.length === 0) {
                vehicleOrderRef.current = data.map(v => v.id);
            }
            
            // Sort vehicles according to original order
            const orderedVehicles = sortByOriginalOrder(data, vehicleOrderRef.current);
            setVehicles(orderedVehicles);
            setError("");
        } catch (err) {
            setError("Unable to load vehicles.");
            console.error("Error loading vehicles:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const sortByOriginalOrder = (vehiclesList, orderArray) => {
        // Create a map for quick lookup
        const vehicleMap = {};
        vehiclesList.forEach(vehicle => {
            vehicleMap[vehicle.id] = vehicle;
        });

        // Sort according to original order
        const orderedVehicles = [];
        
        // First add vehicles in original order that still exist
        orderArray.forEach(id => {
            if (vehicleMap[id]) {
                orderedVehicles.push(vehicleMap[id]);
                delete vehicleMap[id]; // Remove from map
            }
        });

        // Then add any new vehicles that weren't in original order
        Object.values(vehicleMap).forEach(vehicle => {
            orderedVehicles.push(vehicle);
        });

        return orderedVehicles;
    };

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const handleSearch = async (filters) => {
        setLoading(true);
        setError("");
        
        try {
            const data = await searchVehicles(filters);
            
            // For search results, don't maintain original order
            // Reset the order reference for search results
            vehicleOrderRef.current = data.map(v => v.id);
            
            setVehicles(data);
        } catch (err) {
            setError("Search failed.");
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        // Reset the order reference when clearing search
        vehicleOrderRef.current = [];
        setLoading(true);
        loadVehicles();
    };

    const handlePurchaseSuccess = (purchasedVehicleId) => {
        // Update the specific vehicle's stock optimistically
        setVehicles(prevVehicles => 
            prevVehicles.map(vehicle => 
                vehicle.id === purchasedVehicleId 
                    ? { ...vehicle } // Force reference change
                    : vehicle
            )
        );
        
        // Remove from purchasing state
        setPurchasingVehicles(prev => {
            const newState = { ...prev };
            delete newState[purchasedVehicleId];
            return newState;
        });

        // Refresh all vehicles from backend but maintain order
        setTimeout(() => {
            loadVehicles();
        }, 500);
    };

    const setVehiclePurchasing = (vehicleId, isPurchasing) => {
        setPurchasingVehicles(prev => ({
            ...prev,
            [vehicleId]: isPurchasing
        }));
    };

    if (loading) return <h2>Loading vehicles...</h2>;

    if (error) return <h2 className="error-message">{error}</h2>;

    return (
        <div className="dashboard">
            <h2>Available Vehicles</h2>

            <SearchBar onSearch={handleSearch} onClear={handleClear} />

            {vehicles.length === 0 ? (
                <p className="no-results">No vehicles found.</p>
            ) : (
                <div className="vehicle-grid">
                    {vehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            isPurchasing={purchasingVehicles[vehicle.id] || false}
                            onSetPurchasing={setVehiclePurchasing}
                            onPurchaseSuccess={handlePurchaseSuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;