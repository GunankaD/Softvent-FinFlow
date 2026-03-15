package com.softvent.finflow.transactions.receipts.dto;

import com.softvent.finflow.transactions.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReceiptSummaryResponse {
    public String receiptNumber;
    public String ccode;
    public String cname;
    public PaymentMode paymentMode;
    public BigDecimal totalReceived;
    public BigDecimal unappliedAmount;
    public LocalDate receiptDate;
}