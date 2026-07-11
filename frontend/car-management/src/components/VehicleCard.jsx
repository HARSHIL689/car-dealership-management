import { useState } from "react";
import { purchaseVehicle } from "../api/vehicleApi";
import "../styles/vehicle.css";

function VehicleCard({ vehicle, isPurchasing, onSetPurchasing, onPurchaseSuccess }) {
    // State for purchase quantity input
    const [quantity, setQuantity] = useState(1);
    // State for success and error messages
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /**
     * Handle quantity input changes
     * Ensures only valid positive numbers are accepted
     */
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1) {
            setQuantity(value);
        } else if (e.target.value === "") {
            // Reset to default when input is cleared
            setQuantity(1);
        }
    };

    /**
     * Handle vehicle purchase
     * Validates quantity, calls API, and manages success/error states
     */
    const handlePurchase = async () => {
        // Clear previous messages
        setMessage("");
        setError("");

        const purchaseQuantity = Number(quantity);
        
        // Validate quantity is at least 1
        if (isNaN(purchaseQuantity) || purchaseQuantity < 1) {
            setError("Quantity must be at least 1");
            return;
        }

        // Check if enough stock is available
        if (purchaseQuantity > vehicle.quantityInStock) {
            setError(`Not enough stock. Available: ${vehicle.quantityInStock}`);
            return;
        }

        // Notify parent component that purchase is in progress
        onSetPurchasing(vehicle.id, true);

        try {
            // Call purchase API
            const result = await purchaseVehicle(vehicle.id, purchaseQuantity);
            console.log(`Successfully purchased vehicle ${vehicle.id}:`, result);
            
            // Show success message
            setMessage(
                `Successfully purchased ${purchaseQuantity} ${vehicle.make} ${vehicle.model}(s)!`
            );
            
            // Notify parent of successful purchase for list refresh
            onPurchaseSuccess(vehicle.id);
            
            // Reset quantity to default
            setQuantity(1);
            
            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setMessage("");
            }, 3000);
            
        } catch (err) {
            console.error(`Purchase error for vehicle ${vehicle.id}:`, err);
            
            // Handle different error response formats
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
            
            // Notify parent that purchase is complete (failed)
            onSetPurchasing(vehicle.id, false);
        }
    };

    // Determine if purchase controls should be disabled
    const isDisabled = vehicle.quantityInStock === 0 || isPurchasing;

    // Determine stock status for visual indicators
    const getStockStatus = () => {
        if (vehicle.quantityInStock === 0) return 'out-of-stock';
        if (vehicle.quantityInStock < 5) return 'low-stock';
        return 'in-stock';
    };

    // Get appropriate stock label
    const getStockLabel = () => {
        if (vehicle.quantityInStock === 0) return 'Out of Stock';
        if (vehicle.quantityInStock < 5) return 'Low Stock';
        return 'In Stock';
    };

    return (
        <div className={`vehicle-card ${getStockStatus()}`}>
            {/* Stock status indicator bar */}
            <div className={`stock-status-bar ${getStockStatus()}`}></div>

            {/* Vehicle header with category badge */}
            <div className="vehicle-card-header">
                <div className="vehicle-title-section">
                    <h3 className="vehicle-title">
                        {vehicle.make} {vehicle.model}
                    </h3>
                    <span className={`stock-badge ${getStockStatus()}`}>
                        <span className={`stock-dot ${getStockStatus()}`}></span>
                        {getStockLabel()}
                    </span>
                </div>
                <span className="category-badge">
                    <span className="category-icon">🚗</span>
                    {vehicle.category}
                </span>
            </div>

            {/* Vehicle details section */}
            <div className="vehicle-details">
                {/* Category */}
                <div className="detail-row">
                    <span className="detail-label">
                        <span className="detail-icon">📂</span>
                        Category
                    </span>
                    <span className="detail-value">{vehicle.category}</span>
                </div>

                {/* Price with highlighted styling */}
                <div className="detail-row price-row">
                    <span className="detail-label">
                        <span className="detail-icon">💰</span>
                        Price
                    </span>
                    <span className="price-value">
                        ₹{vehicle.price.toLocaleString('en-IN')}
                    </span>
                </div>

                {/* Stock with color-coded indicator */}
                <div className="detail-row">
                    <span className="detail-label">
                        <span className="detail-icon">📦</span>
                        Stock
                    </span>
                    <div className="stock-info">
                        <span className={`stock-count ${getStockStatus()}`}>
                            {vehicle.quantityInStock}
                        </span>
                        <span className="stock-unit">units</span>
                    </div>
                </div>

                {/* Availability status */}
                <div className="detail-row">
                    <span className="detail-label">
                        <span className="detail-icon">✅</span>
                        Status
                    </span>
                    <span className={`availability-badge ${vehicle.quantityInStock > 0 ? 'available' : 'unavailable'}`}>
                        {vehicle.quantityInStock > 0 ? 'Available' : 'Sold Out'}
                    </span>
                </div>
            </div>

            {/* Purchase controls */}
            <div className="purchase-section">
                <div className="purchase-controls">
                    {/* Quantity input with increment/decrement buttons */}
                    <div className="quantity-control">
                        <button
                            type="button"
                            className="qty-btn"
                            onClick={() => {
                                if (quantity > 1) setQuantity(quantity - 1);
                            }}
                            disabled={isDisabled || quantity <= 1}
                        >
                            −
                        </button>
                        
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
                            type="button"
                            className="qty-btn"
                            onClick={() => {
                                if (quantity < vehicle.quantityInStock) {
                                    setQuantity(quantity + 1);
                                }
                            }}
                            disabled={isDisabled || quantity >= vehicle.quantityInStock}
                        >
                            +
                        </button>
                    </div>

                    {/* Purchase button */}
                    <button
                        onClick={handlePurchase}
                        disabled={isDisabled}
                        className={`purchase-btn ${isPurchasing ? 'processing' : ''}`}
                    >
                        {isPurchasing ? (
                            <>
                                <span className="spinner"></span>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>🛒</span>
                                <span>Purchase</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Stock warning message */}
                {vehicle.quantityInStock > 0 && vehicle.quantityInStock < 5 && (
                    <p className="stock-warning">
                        ⚠️ Only {vehicle.quantityInStock} left in stock!
                    </p>
                )}
            </div>

            {/* Success message */}
            {message && (
                <div className="vehicle-message success">
                    <span className="message-icon">✅</span>
                    <span>{message}</span>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="vehicle-message error">
                    <span className="message-icon">❌</span>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default VehicleCard;