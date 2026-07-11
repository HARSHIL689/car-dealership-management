import { useEffect, useState } from "react";
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, restockVehicle } from "../api/vehicleApi";

function Admin() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [restockingVehicle, setRestockingVehicle] = useState(null);
    const [restockQuantity, setRestockQuantity] = useState(1);
    
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        category: "",
        price: "",
        quantityInStock: "",
    });

    const loadVehicles = async () => {
        setLoading(true);
        setError("");
        
        try {
            const data = await getVehicles(true);
            setVehicles(data);
        } catch (err) {
            setError("Failed to load vehicles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const resetForm = () => {
        setFormData({
            make: "",
            model: "",
            category: "",
            price: "",
            quantityInStock: "",
        });
        setEditingVehicle(null);
        setShowForm(false);
    };

    const handleEdit = (vehicle) => {
        setFormData({
            make: vehicle.make,
            model: vehicle.model,
            category: vehicle.category,
            price: vehicle.price.toString(),
            quantityInStock: vehicle.quantityInStock.toString(),
        });
        setEditingVehicle(vehicle);
        setShowForm(true);
        setRestockingVehicle(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const vehicleData = {
            ...formData,
            price: parseFloat(formData.price),
            quantityInStock: parseInt(formData.quantityInStock),
        };

        try {
            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, vehicleData);
                setSuccess("Vehicle updated successfully!");
            } else {
                await addVehicle(vehicleData);
                setSuccess("Vehicle added successfully!");
            }
            
            resetForm();
            loadVehicles();
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.response && err.response.data.fieldErrors) {
                const errors = Object.values(err.response.data.fieldErrors);
                setError(errors.join(", "));
            } else {
                setError("Operation failed.");
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await deleteVehicle(id);
            setSuccess("Vehicle deleted successfully!");
            loadVehicles();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to delete vehicle.");
        }
    };

    const handleRestockClick = (vehicle) => {
        setRestockingVehicle(vehicle);
        setRestockQuantity(1);
        setEditingVehicle(null);
        setShowForm(false);
    };

    const handleRestockSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const quantity = parseInt(restockQuantity, 10);
        
        if (!quantity || quantity < 1) {
            setError("Restock quantity must be at least 1");
            return;
        }

        try {
            const result = await restockVehicle(restockingVehicle.id, quantity);
            console.log("Restock result:", result);
            
            setSuccess(`Successfully restocked ${quantity} ${restockingVehicle.make} ${restockingVehicle.model}(s)! New stock: ${result.quantityInStock}`);
            
            setRestockingVehicle(null);
            setRestockQuantity(1);
            loadVehicles();
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.response && err.response.data.fieldErrors) {
                const errors = Object.values(err.response.data.fieldErrors);
                setError(errors.join(", "));
            } else {
                setError("Restock failed.");
            }
        }
    };

    const cancelRestock = () => {
        setRestockingVehicle(null);
        setRestockQuantity(1);
    };

    if (loading) return <h2>Loading admin panel...</h2>;

    return (
        <div className="admin-panel">
            <h1>Admin Dashboard</h1>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button 
                onClick={() => {
                    resetForm();
                    setRestockingVehicle(null);
                    setShowForm(!showForm);
                }}
                className="toggle-form-btn"
            >
                {showForm ? "Cancel" : "Add New Vehicle"}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="vehicle-form">
                    <h3>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h3>
                    
                    <input
                        type="text"
                        name="make"
                        placeholder="Make"
                        value={formData.make}
                        onChange={handleInputChange}
                        required
                    />
                    
                    <input
                        type="text"
                        name="model"
                        placeholder="Model"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                    />
                    
                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    />
                    
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                    />
                    
                    <input
                        type="number"
                        name="quantityInStock"
                        placeholder="Quantity in Stock"
                        value={formData.quantityInStock}
                        onChange={handleInputChange}
                        required
                        min="0"
                    />
                    
                    <div className="form-buttons">
                        <button type="submit">
                            {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                        </button>
                        
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {restockingVehicle && (
                <div className="restock-form-container">
                    <form onSubmit={handleRestockSubmit} className="restock-form">
                        <h3>Restock: {restockingVehicle.make} {restockingVehicle.model}</h3>
                        
                        <p>Current Stock: <strong>{restockingVehicle.quantityInStock}</strong></p>
                        
                        <div className="restock-controls">
                            <input
                                type="number"
                                min="1"
                                value={restockQuantity}
                                onChange={(e) => setRestockQuantity(e.target.value)}
                                placeholder="Quantity to add"
                                required
                            />
                            
                            <button type="submit" className="restock-btn">
                                Restock
                            </button>
                            
                            <button type="button" onClick={cancelRestock} className="cancel-btn">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="vehicles-list">
                <h2>All Vehicles</h2>
                
                {vehicles.length === 0 ? (
                    <p>No vehicles in the system.</p>
                ) : (
                    <table className="vehicles-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Make</th>
                                <th>Model</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td>{vehicle.id}</td>
                                    <td>{vehicle.make}</td>
                                    <td>{vehicle.model}</td>
                                    <td>{vehicle.category}</td>
                                    <td>₹{vehicle.price.toLocaleString()}</td>
                                    <td>{vehicle.quantityInStock}</td>
                                    <td>
                                        <span className={`status-badge ${vehicle.available ? 'available' : 'out-of-stock'}`}>
                                            {vehicle.available ? "Available" : "Out of Stock"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleEdit(vehicle)} 
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleRestockClick(vehicle)} 
                                                className="restock-btn-small"
                                            >
                                                Restock
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDelete(vehicle.id)} 
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Admin;