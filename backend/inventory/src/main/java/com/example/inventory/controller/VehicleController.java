package com.example.inventory.controller;

import com.example.inventory.dto.vehicle.PurchaseRequest;
import com.example.inventory.dto.vehicle.RestockRequest;
import com.example.inventory.dto.vehicle.VehicleRequest;
import com.example.inventory.dto.vehicle.VehicleResponse;
import com.example.inventory.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // POST /api/vehicles - Add a new vehicle
    @PostMapping
    public ResponseEntity<VehicleResponse> addVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.addVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/vehicles - View all available vehicles
    // Optional: ?includeOutOfStock=true to also see sold-out vehicles
    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(
            @RequestParam(required = false, defaultValue = "false") boolean includeOutOfStock) {
        return ResponseEntity.ok(vehicleService.getAllVehicles(includeOutOfStock));
    }

    // GET /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=
    @GetMapping("/search")
    public ResponseEntity<List<VehicleResponse>> searchVehicles(
            @RequestParam(required = false) String make,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(vehicleService.searchVehicles(make, model, category, minPrice, maxPrice));
    }

    // PUT /api/vehicles/{id} - Update a vehicle's details
    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    // DELETE /api/vehicles/{id} - Admin only (enforced in SecurityConfig)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/vehicles/{id}/purchase - Decrease quantity
    @PostMapping("/{id}/purchase")
    public ResponseEntity<VehicleResponse> purchaseVehicle(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) PurchaseRequest request) {
        PurchaseRequest effectiveRequest = request != null ? request : new PurchaseRequest();
        return ResponseEntity.ok(vehicleService.purchaseVehicle(id, effectiveRequest));
    }

    // POST /api/vehicles/{id}/restock - Admin only (enforced in SecurityConfig)
    @PostMapping("/{id}/restock")
    public ResponseEntity<VehicleResponse> restockVehicle(
            @PathVariable Long id,
            @Valid @RequestBody RestockRequest request) {
        return ResponseEntity.ok(vehicleService.restockVehicle(id, request));
    }
}