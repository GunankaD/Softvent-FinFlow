package com.softvent.finflow.transactions.receipts.dto;

import com.softvent.finflow.transactions.enums.PaymentMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReceiptCreateRequest {

    @NotBlank(message = "Customer code (ccode) is required.")
    public String ccode;

    @NotNull(message = "Payment mode is required.")
    public PaymentMode paymentMode;

    public String referenceNumber;

    @NotNull(message = "Receipt amount is required.")
    @Positive(message = "Receipt amount must be greater than zero.")
    public BigDecimal totalReceived;

    @NotNull(message = "Receipt date is required.")
    public LocalDate receiptDate;
}