import { useState } from "react";
import { purchaseVehicle } from "../api/vehicleApi";

function VehicleCard({ vehicle, isPurchasing, onSetPurchasing, onPurchaseSuccess }) {
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
            setQuantity(value);
        } else if (e.target.value === "") {
            setQuantity(1);
        }
    };

    const handlePurchase = async () => {
        setMessage("");
        setError("");

        const purchaseQuantity = Number(quantity);
        
        if (isNaN(purchaseQuantity) || purchaseQuantity < 1) {
            setError("Quantity must be at least 1");
            return;
        }

        if (purchaseQuantity > vehicle.quantityInStock) {
            setError(`Not enough stock. Available: ${vehicle.quantityInStock}`);
            return;
        }

        // Tell parent this vehicle is being purchased
        onSetPurchasing(vehicle.id, true);

        try {
            const result = await purchaseVehicle(vehicle.id, purchaseQuantity);
            console.log(`Successfully purchased vehicle ${vehicle.id}:`, result);
            
            setMessage(`Successfully purchased ${purchaseQuantity} ${vehicle.make} ${vehicle.model}(s)!`);
            
            // Notify parent of successful purchase
            onPurchaseSuccess(vehicle.id);
            
            // Reset quantity
            setQuantity(1);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage("");
            }, 3000);
            
        } catch (err) {
            console.error(`Purchase error for vehicle ${vehicle.id}:`, err);
            
            if (err.response) {
                if (err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.response.data.fieldErrors) {
                    const errors = Object.values(err.response.data.fieldErrors);
                    setError(errors.join(", "));
                } else {
                    setError("Purchase failed. Please try again.");
                }
            } else {
                setError("Unable to connect to server.");
            }
            
            // Tell parent purchasing is done (failed)
            onSetPurchasing(vehicle.id, false);
        }
    };

    const isDisabled = vehicle.quantityInStock === 0 || isPurchasing;

    return (
        <div className="vehicle-card">
            <h3>
                {vehicle.make} {vehicle.model}
            </h3>
            
            <p>
                <strong>Category:</strong> {vehicle.category}
            </p>
            
            <p>
                <strong>Price:</strong> ₹{vehicle.price.toLocaleString()}
            </p>
            
            <p>
                <strong>Stock:</strong> {vehicle.quantityInStock}
            </p>

            <div className="purchase-controls">
                <input
                    type="number"
                    min="1"
                    max={vehicle.quantityInStock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={isDisabled}
                    className="quantity-input"
                />
                
                <button
                    onClick={handlePurchase}
                    disabled={isDisabled}
                    className="purchase-btn"
                >
                    {isPurchasing ? "Processing..." : "Purchase"}
                </button>
            </div>

            {message && (
                <p className="success-message">
                    {message}
                </p>
            )}

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}
        </div>
    );
}

export default VehicleCard;