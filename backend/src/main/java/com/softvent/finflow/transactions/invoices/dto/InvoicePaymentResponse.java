package com.softvent.finflow.transactions.invoices.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class InvoicePaymentResponse {

    public String receiptNumber;
    public BigDecimal appliedAmount;
    public Instant appliedAt;
}