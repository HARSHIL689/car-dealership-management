package com.example.inventory.repository;

import com.example.inventory.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.math.BigDecimal;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    Optional<Vehicle> findByMakeIgnoreCaseAndModelIgnoreCaseAndCategoryIgnoreCaseAndPrice(
            String make, String model, String category, BigDecimal price);
}