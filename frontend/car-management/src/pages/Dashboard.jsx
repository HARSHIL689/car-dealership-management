import { useEffect, useState } from "react";
import { getVehicles, searchVehicles } from "../api/vehicleApi";
import VehicleCard from "../components/VehicleCard";
import SearchBar from "../components/SearchBar";

function Dashboard() {

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadVehicles = async () => {
        try {
            const data = await getVehicles(true);
            setVehicles(data);
        } catch (err) {
            setError("Unable to load vehicles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleSearch = async (filters) => {
        try {
            const data = await searchVehicles(filters);
            setVehicles(data);
        } catch (err) {
            setError("Search failed.");
        }
    };

    const handleClear = () => {
        setLoading(true);
        loadVehicles();
    };

    if (loading) return <h2>Loading...</h2>;

    if (error) return <h2>{error}</h2>;

    return (
        <div className="dashboard">

            <h2>Available Vehicles</h2>

            <SearchBar
                onSearch={handleSearch}
                onClear={handleClear}
            />

            <div className="vehicle-grid">

                {vehicles.length === 0 ? (
                    <p>No vehicles found.</p>
                ) : (
                    vehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                        />
                    ))
                )}

            </div>

        </div>
    );
}

export default Dashboard;