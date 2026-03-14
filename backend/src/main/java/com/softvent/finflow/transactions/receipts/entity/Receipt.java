package com.softvent.finflow.transactions.receipts.entity;

import com.softvent.finflow.customers.entity.Customer;
import com.softvent.finflow.transactions.enums.PaymentMode;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/*
                                      Table "public.receipts"
      Column      |           Type           | Collation | Nullable |           Default
------------------+--------------------------+-----------+----------+------------------------------
 rid              | bigint                   |           | not null | generated always as identity
 cid              | bigint                   |           | not null |
 receipt_number   | character varying(50)    |           | not null |
 payment_mode     | payment_mode_enum        |           | not null |
 reference_number | character varying(100)   |           |          |
 total_received   | numeric(12,2)            |           | not null |
 receipt_date     | date                     |           | not null |
 created_at       | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 deleted_at       | timestamp with time zone |           |          |
 unapplied_amount | numeric(12,2)            |           | not null | 0
Indexes:
    "receipts_pkey" PRIMARY KEY, btree (rid)
    "idx_receipts_cid" btree (cid)
    "receipts_receipt_number_key" UNIQUE CONSTRAINT, btree (receipt_number)
Check constraints:
    "chk_receipt_unapplied_nonnegative" CHECK (unapplied_amount >= 0::numeric)
Foreign-key constraints:
    "fk_receipt_customer" FOREIGN KEY (cid) REFERENCES customers(cid) ON DELETE RESTRICT
Referenced by:
    TABLE "payment_applications" CONSTRAINT "fk_payment_application_receipt" FOREIGN KEY (rid) REFERENCES receipts(rid) ON DELETE RESTRICT
 */
@Entity
@Table(name = "receipts")
public class Receipt extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long rid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cid", nullable = false)
    public Customer customer;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 50)
    public String receiptNumber;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name="payment_mode", nullable=false, columnDefinition="payment_mode_enum")
    public PaymentMode paymentMode;

    @Column(name = "reference_number", length = 100)
    public String referenceNumber;

    @Column(name = "total_received", nullable = false, precision = 12, scale = 2)
    public BigDecimal totalReceived;

    @Column(name = "unapplied_amount", nullable = false, precision = 12, scale = 2)
    public BigDecimal unappliedAmount;

    @Column(name = "receipt_date", nullable = false)
    public LocalDate receiptDate;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @Column(name = "deleted_at")
    public Instant deletedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}