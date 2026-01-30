package com.softvent.finflow.transactions;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/*
                                            Table "public.transactions"
      Column      |            Type             | Collation | Nullable |                  Default
------------------+-----------------------------+-----------+----------+-------------------------------------------
 tid              | bigint                      |           | not null | nextval('transactions_tid_seq'::regclass)
 cid              | bigint                      |           | not null |
 transaction_type | character varying(20)       |           | not null |
 parent_tid       | bigint                      |           |          |
 total_amount     | numeric(12,2)               |           | not null |
 paid_amount      | numeric(12,2)               |           | not null |
 balance_amount   | numeric(12,2)               |           | not null |
 transaction_date | date                        |           | not null |
 created_at       | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "transactions_pkey" PRIMARY KEY, btree (tid)

 */

@Entity
@Table(name = "transactions")
public class Transaction extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long tid;

    @Column(nullable = false)
    public Long cid;   // customer id (no FK yet)

    @Column(name = "transaction_type", nullable = false, length = 20)
    public String transactionType;   // INVOICE / RECEIPT (varchar for now)

    @Column(name = "parent_tid")
    public Long parentTid;   // invoice tid for receipts

    @Column(name = "total_amount", nullable = false)
    public BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false)
    public BigDecimal paidAmount;

    @Column(name = "balance_amount", nullable = false)
    public BigDecimal balanceAmount;

    @Column(name = "transaction_date", nullable = false)
    public LocalDate transactionDate;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
}

