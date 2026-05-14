package com.softvent.finflow.outstandingsummary.dto;

import java.math.BigDecimal;

public class OutstandingSummaryResponse {

    public String ccode;
    public String cname;

    public BigDecimal totalInvoiceAmount;
    public BigDecimal totalReceiptAmount;
    public BigDecimal totalAppliedAmount;
    public BigDecimal netOutstanding;
}