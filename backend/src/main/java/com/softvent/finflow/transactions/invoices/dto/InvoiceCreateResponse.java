package com.softvent.finflow.transactions.invoices.dto;

public class InvoiceCreateResponse {
    public String invoiceNumber;
    public InvoiceCreateResponse(String invoiceNumber){
        this.invoiceNumber = invoiceNumber;
    }
}
