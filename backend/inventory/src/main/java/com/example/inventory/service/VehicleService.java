package com.example.inventory.service;

import com.example.inventory.dto.vehicle.PurchaseRequest;
import com.example.inventory.dto.vehicle.RestockRequest;
import com.example.inventory.dto.vehicle.VehicleRequest;
import com.example.inventory.dto.vehicle.VehicleResponse;
import com.example.inventory.entity.Vehicle;
import com.example.inventory.exception.DuplicateVehicleException;
import com.example.inventory.exception.InsufficientStockException;
import com.example.inventory.exception.VehicleNotFoundException;
import com.example.inventory.repository.VehicleRepository;
import com.example.inventory.repository.VehicleSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Transactional
    public VehicleResponse addVehicle(VehicleRequest request) {
        // Check for duplicate vehicle
        List<Vehicle> allVehicles = vehicleRepository.findAll();

        Optional<Vehicle> existingVehicle = allVehicles.stream()
                .filter(v -> v.getMake().equalsIgnoreCase(request.getMake()))
                .filter(v -> v.getModel().equalsIgnoreCase(request.getModel()))
                .filter(v -> v.getCategory().equalsIgnoreCase(request.getCategory()))
                .filter(v -> v.getPrice().compareTo(request.getPrice()) == 0)
                .findFirst();

        if (existingVehicle.isPresent()) {
            Vehicle duplicate = existingVehicle.get();
            throw new DuplicateVehicleException(
                    "A vehicle with make '" + request.getMake() +
                            "', model '" + request.getModel() +
                            "', category '" + request.getCategory() +
                            "', and price " + request.getPrice() +
                            " already exists with ID: " + duplicate.getId()
            );
        }

        Vehicle vehicle = Vehicle.builder()
                .make(request.getMake())
                .model(request.getModel())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantityInStock(request.getQuantityInStock())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Added new vehicle with ID: {}", savedVehicle.getId());

        return toResponse(savedVehicle);
    }

    /**
     * Lists vehicles. By default only shows vehicles that are actually available
     * (quantityInStock > 0), matching the "view all available vehicles" requirement.
     * Pass includeOutOfStock=true to see the full inventory, including sold-out vehicles.
     */
    public List<VehicleResponse> getAllVehicles(boolean includeOutOfStock) {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return vehicles.stream()
                .filter(v -> includeOutOfStock || v.getQuantityInStock() > 0)
                .map(this::toResponse)
                .toList();
    }

    public List<VehicleResponse> searchVehicles(String make, String model, String category,
                                                BigDecimal minPrice, BigDecimal maxPrice) {
        var spec = VehicleSpecification.build(make, model, category, minPrice, maxPrice);
        return vehicleRepository.findAll(spec).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);

        // Check for duplicate if make, model, category, or price is being changed
        if (!vehicle.getMake().equalsIgnoreCase(request.getMake()) ||
                !vehicle.getModel().equalsIgnoreCase(request.getModel()) ||
                !vehicle.getCategory().equalsIgnoreCase(request.getCategory()) ||
                vehicle.getPrice().compareTo(request.getPrice()) != 0) {

            List<Vehicle> allVehicles = vehicleRepository.findAll();

            Optional<Vehicle> duplicateVehicle = allVehicles.stream()
                    .filter(v -> !v.getId().equals(id))
                    .filter(v -> v.getMake().equalsIgnoreCase(request.getMake()))
                    .filter(v -> v.getModel().equalsIgnoreCase(request.getModel()))
                    .filter(v -> v.getCategory().equalsIgnoreCase(request.getCategory()))
                    .filter(v -> v.getPrice().compareTo(request.getPrice()) == 0)
                    .findFirst();

            if (duplicateVehicle.isPresent()) {
                Vehicle duplicate = duplicateVehicle.get();
                throw new DuplicateVehicleException(
                        "A vehicle with make '" + request.getMake() +
                                "', model '" + request.getModel() +
                                "', category '" + request.getCategory() +
                                "', and price " + request.getPrice() +
                                " already exists with ID: " + duplicate.getId()
                );
            }
        }

        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setCategory(request.getCategory());
        vehicle.setPrice(request.getPrice());
        vehicle.setQuantityInStock(request.getQuantityInStock());

        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public VehicleResponse purchaseVehicle(Long id, PurchaseRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);

        int requestedQty = request.getQuantity() == null ? 1 : request.getQuantity();

        if (vehicle.getQuantityInStock() < requestedQty) {
            throw new InsufficientStockException(
                    "Not enough stock for vehicle id " + id + ". Available: "
                            + vehicle.getQuantityInStock() + ", requested: " + requestedQty);
        }

        vehicle.setQuantityInStock(vehicle.getQuantityInStock() - requestedQty);
        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleResponse restockVehicle(Long id, RestockRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicle.setQuantityInStock(vehicle.getQuantityInStock() + request.getQuantity());
        return toResponse(vehicleRepository.save(vehicle));
    }

    private Vehicle getVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(id));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .category(vehicle.getCategory())
                .price(vehicle.getPrice())
                .quantityInStock(vehicle.getQuantityInStock())
                .available(vehicle.getQuantityInStock() > 0)
                .build();
    }
}