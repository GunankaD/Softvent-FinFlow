package com.softvent.finflow.transactions.invoices.dto;

import com.softvent.finflow.transactions.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public class InvoiceSummaryResponse {

    public Long invid;
    public String invoiceNumber;
    public String ccode;
    public String cname;
    public BigDecimal totalAmount;
    public BigDecimal balanceAmount;
    public InvoiceStatus status;
    public LocalDate invoiceDate;
    public LocalDate dueDate;
}