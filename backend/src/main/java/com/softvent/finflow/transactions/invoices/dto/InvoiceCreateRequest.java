package com.softvent.finflow.transactions.invoices.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceCreateRequest {

    @NotBlank(message = "Customer code (ccode) is required.")
    public String ccode;

    @NotNull(message = "Invoice date is required.")
    public LocalDate invoiceDate;

    public LocalDate dueDate;

    @NotEmpty(message = "An invoice must contain at least one item.")
    public List<@Valid InvoiceItemRequest> items;

    public static class InvoiceItemRequest {

        @NotBlank(message = "Item code (icode) is required.")
        public String icode;

        @NotNull(message = "Quantity is required.")
        @Positive(message = "Quantity must be greater than zero.")
        public BigDecimal quantity;

        // If passed, it shouldn't be negative or over 100%.
        @DecimalMin(value = "0.0", message = "Discount cannot be negative.")
        @DecimalMax(value = "100.0", message = "Discount cannot exceed 100%.")
        public BigDecimal discountPercent;
    }
}