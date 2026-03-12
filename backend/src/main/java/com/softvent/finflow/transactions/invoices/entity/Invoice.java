package com.softvent.finflow.transactions.invoices.entity;

import com.softvent.finflow.customers.entity.Customer;
import com.softvent.finflow.transactions.enums.InvoiceStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/*
                                     Table "public.invoices"
     Column     |           Type           | Collation | Nullable |           Default
----------------+--------------------------+-----------+----------+------------------------------
 invid          | bigint                   |           | not null | generated always as identity
 cid            | bigint                   |           | not null |
 invoice_number | character varying(50)    |           | not null |
 total_amount   | numeric(12,2)            |           | not null | 0
 invoice_date   | date                     |           | not null |
 due_date       | date                     |           |          |
 status         | invoice_status_enum      |           | not null | 'DRAFT'::invoice_status_enum
 created_at     | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 deleted_at     | timestamp with time zone |           |          |
Indexes:
    "invoices_pkey" PRIMARY KEY, btree (invid)
    "idx_invoices_cid" btree (cid)
    "invoices_invoice_number_key" UNIQUE CONSTRAINT, btree (invoice_number)
Foreign-key constraints:
    "fk_invoice_customer" FOREIGN KEY (cid) REFERENCES customers(cid) ON DELETE RESTRICT
Referenced by:
    TABLE "invoice_items" CONSTRAINT "fk_invoice_items_invoice" FOREIGN KEY (invid) REFERENCES invoices(invid) ON DELETE CASCADE
    TABLE "payment_applications" CONSTRAINT "fk_payment_application_invoice" FOREIGN KEY (invid) REFERENCES invoices(invid) ON DELETE RESTRICT
 */

@Entity
@Table(name = "invoices")
public class Invoice extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long invid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cid", nullable = false)
    public Customer customer;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    public String invoiceNumber;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    public BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "invoice_date", nullable = false)
    public LocalDate invoiceDate;

    @Column(name = "due_date")
    public LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "invoice_status_enum")
    public InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "deleted_at")
    public Instant deletedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}