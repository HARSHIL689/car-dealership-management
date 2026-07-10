package com.example.inventory.repository;

import com.example.inventory.entity.Vehicle;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class VehicleSpecification {

    private VehicleSpecification() {
    }

    public static Specification<Vehicle> hasMake(String make) {
        return (root, query, cb) ->
                make == null || make.isBlank()
                        ? null
                        : cb.equal(cb.lower(root.get("make")), make.toLowerCase());
    }

    public static Specification<Vehicle> hasModel(String model) {
        return (root, query, cb) ->
                model == null || model.isBlank()
                        ? null
                        : cb.equal(cb.lower(root.get("model")), model.toLowerCase());
    }

    public static Specification<Vehicle> hasCategory(String category) {
        return (root, query, cb) ->
                category == null || category.isBlank()
                        ? null
                        : cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }

    public static Specification<Vehicle> priceGreaterThanOrEqual(BigDecimal minPrice) {
        return (root, query, cb) ->
                minPrice == null ? null : cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<Vehicle> priceLessThanOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) ->
                maxPrice == null ? null : cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }

    public static Specification<Vehicle> build(String make, String model, String category,
                                               BigDecimal minPrice, BigDecimal maxPrice) {
        return Specification.where(hasMake(make))
                .and(hasModel(model))
                .and(hasCategory(category))
                .and(priceGreaterThanOrEqual(minPrice))
                .and(priceLessThanOrEqual(maxPrice));
    }
}