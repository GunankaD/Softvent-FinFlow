package com.softvent.finflow.items.dto;

public class AvailabilityResponse {
    public boolean available;
    public AvailabilityResponse(boolean available) {
        this.available = available;
    }

    public boolean isAvailable() {
        return available;
    }
}