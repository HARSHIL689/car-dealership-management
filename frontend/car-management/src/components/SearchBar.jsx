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
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const params = {};

        Object.keys(filters).forEach((key) => {
            if (filters[key] !== "") {
                params[key] = filters[key];
            }
        });

        onSearch(params);
    };

    const handleClear = () => {
        const emptyFilters = {
            make: "",
            model: "",
            category: "",
            minPrice: "",
            maxPrice: "",
        };

        setFilters(emptyFilters);
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
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleChange}
            />

            <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleChange}
            />

            <button type="submit">
                Search
            </button>

            <button
                type="button"
                onClick={handleClear}
            >
                Clear
            </button>

        </form>
    );
}

export default SearchBar;