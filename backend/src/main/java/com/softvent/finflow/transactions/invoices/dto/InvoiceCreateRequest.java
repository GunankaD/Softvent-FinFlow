package com.softvent.finflow.transactions.invoices.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceCreateRequest {

    @NotNull(message = "Customer ID (cid) is required.")
    public Long cid;

    @NotNull(message = "Invoice date is required.")
    public LocalDate invoiceDate;

    public LocalDate dueDate;

    @NotEmpty(message = "An invoice must contain at least one item.")
    @Valid // CRITICAL: This ensures the constraints inside InvoiceItemRequest are checked!
    public List<InvoiceItemRequest> items;

    public static class InvoiceItemRequest {

        @NotNull(message = "Item ID (iid) is required.")
        public Long iid;

        @NotNull(message = "Quantity is required.")
        @Positive(message = "Quantity must be greater than zero.")
        public BigDecimal quantity;

        // If passed, it shouldn't be negative or over 100%.
        @DecimalMin(value = "0.0", message = "Discount cannot be negative.")
        @DecimalMax(value = "100.0", message = "Discount cannot exceed 100%.")
        public BigDecimal discountPercent;
    }
}