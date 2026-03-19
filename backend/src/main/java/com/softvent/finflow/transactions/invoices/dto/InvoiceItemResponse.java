package com.softvent.finflow.transactions.invoices.dto;

import java.math.BigDecimal;

public class InvoiceItemResponse {
    public Long iid;
    public String itemCode;
    public String itemName;
    public BigDecimal quantity;
    public BigDecimal rate;
    public BigDecimal discountPercent;
    public BigDecimal lineAmount;
    public BigDecimal gstRate;
    public BigDecimal lineTotal;
}