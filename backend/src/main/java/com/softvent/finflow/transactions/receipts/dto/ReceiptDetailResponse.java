package com.softvent.finflow.transactions.receipts.dto;

import com.softvent.finflow.transactions.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReceiptDetailResponse {
    public String receiptNumber;
    public String ccode;
    public String cname;
    public PaymentMode paymentMode;
    public String referenceNumber;
    public BigDecimal totalReceived;
    public BigDecimal unappliedAmount;
    public LocalDate receiptDate;
    public List<ReceiptApplicationResponse> applications;
}