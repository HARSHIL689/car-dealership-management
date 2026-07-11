import { useEffect, useState } from "react";
import { getVehicles } from "../api/vehicleApi";
import VehicleCard from "../components/VehicleCard";

function Dashboard() {

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchVehicles = async () => {

            try {
                const data = await getVehicles();

                setVehicles(data);
            }
            catch (err) {

                if (err.response) {
                    setError(err.response.data.message);
                }
                else {
                    setError("Unable to connect to server.");
                }

            }
            finally {
                setLoading(false);
            }

        };

        fetchVehicles();

    }, []);

    if (loading)
        return <h2>Loading...</h2>;

    if (error)
        return <h2>{error}</h2>;

    return (

        <div className="dashboard">

            <h2>Available Vehicles</h2>

            <div className="vehicle-grid">

                {vehicles.length === 0 ? (

                    <p>No vehicles available.</p>

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