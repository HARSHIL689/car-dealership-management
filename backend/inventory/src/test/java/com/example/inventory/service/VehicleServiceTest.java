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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleVehicle = Vehicle.builder()
                .id(1L)
                .make("Toyota")
                .model("Corolla")
                .category("Sedan")
                .price(new BigDecimal("22000.00"))
                .quantityInStock(5)
                .build();
    }

    @Test
    @DisplayName("addVehicle() saves a new vehicle when no duplicate exists")
    void addVehicle_savesSuccessfully_whenNoDuplicateExists() {
        VehicleRequest request = new VehicleRequest("Honda", "Civic", "Sedan",
                new BigDecimal("21000.00"), 3);

        when(vehicleRepository.findAll()).thenReturn(List.of(sampleVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> {
            Vehicle v = invocation.getArgument(0);
            v.setId(2L);
            return v;
        });

        VehicleResponse response = vehicleService.addVehicle(request);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getMake()).isEqualTo("Honda");
        assertThat(response.isAvailable()).isTrue();
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("addVehicle() throws DuplicateVehicleException for an identical vehicle")
    void addVehicle_throwsException_whenDuplicateExists() {
        VehicleRequest request = new VehicleRequest("Toyota", "Corolla", "Sedan",
                new BigDecimal("22000.00"), 2);

        when(vehicleRepository.findAll()).thenReturn(List.of(sampleVehicle));

        assertThatThrownBy(() -> vehicleService.addVehicle(request))
                .isInstanceOf(DuplicateVehicleException.class)
                .hasMessageContaining("already exists");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("getAllVehicles() excludes out-of-stock vehicles by default")
    void getAllVehicles_excludesOutOfStock_byDefault() {
        Vehicle outOfStock = Vehicle.builder()
                .id(2L).make("Ford").model("Focus").category("Hatchback")
                .price(new BigDecimal("18000.00")).quantityInStock(0).build();

        when(vehicleRepository.findAll()).thenReturn(List.of(sampleVehicle, outOfStock));

        List<VehicleResponse> result = vehicleService.getAllVehicles(false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMake()).isEqualTo("Toyota");
    }

    @Test
    @DisplayName("getAllVehicles() includes out-of-stock vehicles when requested")
    void getAllVehicles_includesOutOfStock_whenFlagIsTrue() {
        Vehicle outOfStock = Vehicle.builder()
                .id(2L).make("Ford").model("Focus").category("Hatchback")
                .price(new BigDecimal("18000.00")).quantityInStock(0).build();

        when(vehicleRepository.findAll()).thenReturn(List.of(sampleVehicle, outOfStock));

        List<VehicleResponse> result = vehicleService.getAllVehicles(true);

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("purchaseVehicle() reduces stock when enough quantity is available")
    void purchaseVehicle_reducesStock_whenSufficientQuantityAvailable() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));

        VehicleResponse response = vehicleService.purchaseVehicle(1L, new PurchaseRequest(2));

        assertThat(response.getQuantityInStock()).isEqualTo(3);
        assertThat(response.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("purchaseVehicle() throws InsufficientStockException when quantity requested exceeds stock")
    void purchaseVehicle_throwsException_whenStockInsufficient() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));

        assertThatThrownBy(() -> vehicleService.purchaseVehicle(1L, new PurchaseRequest(10)))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Not enough stock");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("purchaseVehicle() throws VehicleNotFoundException for a non-existent vehicle")
    void purchaseVehicle_throwsException_whenVehicleDoesNotExist() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.purchaseVehicle(99L, new PurchaseRequest(1)))
                .isInstanceOf(VehicleNotFoundException.class);
    }

    @Test
    @DisplayName("restockVehicle() increases stock by the requested quantity")
    void restockVehicle_increasesStock() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));

        VehicleResponse response = vehicleService.restockVehicle(1L, new RestockRequest(10));

        assertThat(response.getQuantityInStock()).isEqualTo(15);
    }

    @Test
    @DisplayName("deleteVehicle() removes the vehicle when it exists")
    void deleteVehicle_removesVehicle_whenExists() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository, times(1)).delete(sampleVehicle);
    }

    @Test
    @DisplayName("deleteVehicle() throws VehicleNotFoundException when the vehicle does not exist")
    void deleteVehicle_throwsException_whenNotFound() {
        when(vehicleRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.deleteVehicle(42L))
                .isInstanceOf(VehicleNotFoundException.class);

        verify(vehicleRepository, never()).delete((Vehicle) any());
    }
}