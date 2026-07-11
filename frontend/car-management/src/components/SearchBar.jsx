import { useState } from "react";
import "../styles/searchbar.css";

function SearchBar({ onSearch, onClear }) {
    // State to manage all filter inputs
    const [filters, setFilters] = useState({
        make: "",
        model: "",
        category: "",
        minPrice: "",
        maxPrice: "",
    });

    // Track which filters are active for visual feedback
    const [activeFilters, setActiveFilters] = useState(0);

    /**
     * Handle input changes for all filter fields
     * Validates price fields to accept only positive numbers
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For price fields, only allow numbers and empty string
        if ((name === "minPrice" || name === "maxPrice") && value !== "") {
            if (isNaN(value) || parseFloat(value) < 0) {
                return;
            }
        }
        
        const updatedFilters = {
            ...filters,
            [name]: value,
        };
        
        setFilters(updatedFilters);
        
        // Count active filters for UI feedback
        const activeCount = Object.values(updatedFilters)
            .filter(val => val !== "").length;
        setActiveFilters(activeCount);
    };

    /**
     * Handle search form submission
     * Converts price strings to numbers and removes empty filters
     */
    const handleSearch = (e) => {
        e.preventDefault();

        const params = {};
        
        Object.keys(filters).forEach((key) => {
            if (filters[key] !== "") {
                // Convert price strings to numbers for API compatibility
                if (key === "minPrice" || key === "maxPrice") {
                    params[key] = parseFloat(filters[key]);
                } else {
                    params[key] = filters[key];
                }
            }
        });

        onSearch(params);
    };

    /**
     * Clear all filters and reset to initial state
     */
    const handleClear = () => {
        const emptyFilters = {
            make: "",
            model: "",
            category: "",
            minPrice: "",
            maxPrice: "",
        };
        
        setFilters(emptyFilters);
        setActiveFilters(0);
        onClear();
    };

    return (
        <div className="search-container">
            <div className="search-header">
                <div className="search-title">
                    <span className="search-icon">🔍</span>
                    <h3>Search Vehicles</h3>
                </div>
                {activeFilters > 0 && (
                    <span className="active-filters-badge">
                        {activeFilters} active filter{activeFilters !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <form className="search-form" onSubmit={handleSearch}>
                {/* Make filter */}
                <div className="search-field">
                    <label className="search-label">
                        <span className="label-icon">🏭</span>
                        Make
                    </label>
                    <input
                        name="make"
                        type="text"
                        placeholder="e.g., Toyota, Honda..."
                        value={filters.make}
                        onChange={handleChange}
                        className={`search-input ${filters.make ? 'active' : ''}`}
                    />
                </div>

                {/* Model filter */}
                <div className="search-field">
                    <label className="search-label">
                        <span className="label-icon">🚙</span>
                        Model
                    </label>
                    <input
                        name="model"
                        type="text"
                        placeholder="e.g., Camry, Civic..."
                        value={filters.model}
                        onChange={handleChange}
                        className={`search-input ${filters.model ? 'active' : ''}`}
                    />
                </div>

                {/* Category filter */}
                <div className="search-field">
                    <label className="search-label">
                        <span className="label-icon">📂</span>
                        Category
                    </label>
                    <input
                        name="category"
                        type="text"
                        placeholder="e.g., Sedan, SUV..."
                        value={filters.category}
                        onChange={handleChange}
                        className={`search-input ${filters.category ? 'active' : ''}`}
                    />
                </div>

                {/* Min Price filter */}
                <div className="search-field">
                    <label className="search-label">
                        <span className="label-icon">💰</span>
                        Min Price
                    </label>
                    <input
                        name="minPrice"
                        type="number"
                        placeholder="₹ Minimum"
                        value={filters.minPrice}
                        onChange={handleChange}
                        min="0"
                        className={`search-input ${filters.minPrice ? 'active' : ''}`}
                    />
                </div>

                {/* Max Price filter */}
                <div className="search-field">
                    <label className="search-label">
                        <span className="label-icon">💎</span>
                        Max Price
                    </label>
                    <input
                        name="maxPrice"
                        type="number"
                        placeholder="₹ Maximum"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        min="0"
                        className={`search-input ${filters.maxPrice ? 'active' : ''}`}
                    />
                </div>

                {/* Action buttons */}
                <div className="search-actions">
                    <button 
                        type="submit" 
                        className="search-btn"
                        title="Search vehicles"
                    >
                        <span className="btn-icon">🔍</span>
                        <span>Search</span>
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleClear}
                        className="clear-btn"
                        title="Clear all filters"
                    >
                        <span className="btn-icon">🔄</span>
                        <span>Clear</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SearchBar;