import { useState } from "react";

function SearchBar({ onSearch, onClear }) {
    const [filters, setFilters] = useState({
        make: "",
        model: "",
        category: "",
        minPrice: "",
        maxPrice: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For price fields, only allow numbers and empty string
        if ((name === "minPrice" || name === "maxPrice") && value !== "") {
            if (isNaN(value) || parseFloat(value) < 0) {
                return;
            }
        }
        
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const params = {};
        
        Object.keys(filters).forEach((key) => {
            if (filters[key] !== "") {
                // Convert price strings to numbers
                if (key === "minPrice" || key === "maxPrice") {
                    params[key] = parseFloat(filters[key]);
                } else {
                    params[key] = filters[key];
                }
            }
        });

        onSearch(params);
    };

    const handleClear = () => {
        setFilters({
            make: "",
            model: "",
            category: "",
            minPrice: "",
            maxPrice: "",
        });
        onClear();
    };

    return (
        <form className="search-form" onSubmit={handleSearch}>
            <input
                name="make"
                placeholder="Make"
                value={filters.make}
                onChange={handleChange}
            />
            
            <input
                name="model"
                placeholder="Model"
                value={filters.model}
                onChange={handleChange}
            />
            
            <input
                name="category"
                placeholder="Category"
                value={filters.category}
                onChange={handleChange}
            />
            
            <input
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleChange}
            />
            
            <input
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleChange}
            />
            
            <button type="submit">
                Search
            </button>
            
            <button type="button" onClick={handleClear}>
                Clear
            </button>
        </form>
    );
}

export default SearchBar;