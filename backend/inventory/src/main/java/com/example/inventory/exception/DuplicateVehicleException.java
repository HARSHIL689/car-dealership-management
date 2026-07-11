package com.example.inventory.exception;

public class DuplicateVehicleException extends RuntimeException {

    public DuplicateVehicleException(String message) {
        super(message);
    }

    public DuplicateVehicleException(String message, Throwable cause) {
        super(message, cause);
    }
}