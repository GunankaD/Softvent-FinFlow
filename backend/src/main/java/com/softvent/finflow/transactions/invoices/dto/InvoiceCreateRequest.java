package com.softvent.finflow.transactions.invoices.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceCreateRequest {

    public Long cid;
    public LocalDate invoiceDate;
    public LocalDate dueDate;
    public List<InvoiceItemRequest> items;

    public static class InvoiceItemRequest {
        public Long iid;
        public BigDecimal quantity;
        public BigDecimal discountPercent;
    }
}
