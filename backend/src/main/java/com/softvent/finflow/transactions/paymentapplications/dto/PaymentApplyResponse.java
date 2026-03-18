package com.softvent.finflow.transactions.paymentapplications.dto;

import java.math.BigDecimal;

public class PaymentApplyResponse {

    public String receiptNumber;
    public BigDecimal totalApplied;
    public BigDecimal remainingAmount;
    public PaymentApplyResponse(String receiptNumber,
                                BigDecimal totalApplied,
                                BigDecimal remainingAmount) {

        this.receiptNumber = receiptNumber;
        this.totalApplied = totalApplied;
        this.remainingAmount = remainingAmount;
    }
}