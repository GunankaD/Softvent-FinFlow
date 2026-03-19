package com.softvent.finflow.transactions.paymentapplications.dto;

import com.softvent.finflow.transactions.receipts.dto.ReceiptApplicationResponse;

import java.math.BigDecimal;
import java.util.List;

public class PaymentApplyResponse {

    public String receiptNumber;
    public BigDecimal totalApplied;
    public BigDecimal remainingAmount;
    public List<ReceiptApplicationResponse> applications;

    public PaymentApplyResponse(String receiptNumber,
                                BigDecimal totalApplied,
                                BigDecimal remainingAmount,
                                List<ReceiptApplicationResponse> applications) {

        this.receiptNumber = receiptNumber;
        this.totalApplied = totalApplied;
        this.remainingAmount = remainingAmount;
        this.applications = applications;
    }
}