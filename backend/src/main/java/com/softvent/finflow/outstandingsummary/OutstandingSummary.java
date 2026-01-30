package com.softvent.finflow.outstandingsummary;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;

/*
                      Table "public.outstanding_summary"
        Column        |         Type          | Collation | Nullable | Default
----------------------+-----------------------+-----------+----------+---------
 cid                  | bigint                |           | not null |
 ccode                | character varying(20) |           | not null |
 total_bill_amount    | numeric(12,2)         |           | not null | 0
 total_receipt_amount | numeric(12,2)         |           | not null | 0
 balance_amount       | numeric(12,2)         |           | not null | 0
Indexes:
    "outstanding_summary_pkey" PRIMARY KEY, btree (cid)
*/

@Entity
@Table(name = "outstanding_summary")
public class OutstandingSummary extends PanacheEntityBase {

    @Id
    @Column(nullable = false)
    public Long cid;   // customer id (PK, no auto-gen)

    @Column(nullable = false, length = 20)
    public String ccode;

    @Column(name = "total_bill_amount", nullable = false)
    public BigDecimal totalBillAmount;

    @Column(name = "total_receipt_amount", nullable = false)
    public BigDecimal totalReceiptAmount;

    @Column(name = "balance_amount", nullable = false)
    public BigDecimal balanceAmount;
}

