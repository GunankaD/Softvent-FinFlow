package com.softvent.finflow.transactions.receipts.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ReceiptApplicationResponse {
    public String invoiceNumber;
    public BigDecimal appliedAmount;
    public Instant appliedAt;
}