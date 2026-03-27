package com.softvent.finflow.transactions.paymentapplications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class PaymentApplicationItems {

    @NotBlank(message = "Invoice number is required.")
    public String invoiceNumber;

    @NotNull(message = "Applied amount is required.")
    @Positive(message = "Applied amount must be greater than zero.")
    public BigDecimal appliedAmount;
}