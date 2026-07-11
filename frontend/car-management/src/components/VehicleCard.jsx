function VehicleCard({ vehicle }) {
    return (
        <div className="vehicle-card">

            <h3>
                {vehicle.make} {vehicle.model}
            </h3>

            <p>
                <strong>Category:</strong> {vehicle.category}
            </p>

            <p>
                <strong>Price:</strong> ₹{vehicle.price}
            </p>

            <p>
                <strong>Stock:</strong> {vehicle.quantityInStock}
            </p>

            <button
                disabled={vehicle.quantityInStock === 0}
            >
                Purchase
            </button>

        </div>
    );
}

export default VehicleCard;