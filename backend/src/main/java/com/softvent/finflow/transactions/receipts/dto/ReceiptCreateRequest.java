package com.softvent.finflow.transactions.receipts.dto;

import com.softvent.finflow.transactions.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReceiptCreateRequest {
    public Long cid;
    public PaymentMode paymentMode;
    public String referenceNumber;
    public BigDecimal totalReceived;
    public LocalDate receiptDate;
    public List<ReceiptApplicationRequest> applications;
}