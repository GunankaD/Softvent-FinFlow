package com.softvent.finflow.customers.dto;

public class AvailabilityResponse {
    public boolean available;
    public AvailabilityResponse(boolean available) {
        this.available = available;
    }

    public boolean isAvailable() {
        return available;
    }
}
