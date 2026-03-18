package com.softvent.finflow.transactions.invoices.dto;

import com.softvent.finflow.transactions.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceDetailResponse {
    public Long invid;
    public String invoiceNumber;
    public String ccode;
    public String cname;
    public LocalDate invoiceDate;
    public LocalDate dueDate;
    public InvoiceStatus status;
    public BigDecimal totalAmount;
    public BigDecimal paidAmount;
    public BigDecimal balanceAmount;
    public List<InvoiceItemResponse> items;
    public List<InvoicePaymentResponse> payments;
}