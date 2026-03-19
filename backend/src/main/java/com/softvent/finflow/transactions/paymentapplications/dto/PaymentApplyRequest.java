package com.softvent.finflow.transactions.paymentapplications.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PaymentApplyRequest {

    @NotBlank(message = "Receipt number is required.")
    public String receiptNumber;

    @NotNull(message = "Applications list is required.")
    @NotEmpty(message = "At least one invoice must be provided.")
    public List<@Valid PaymentApplicationRequest> applications;
}