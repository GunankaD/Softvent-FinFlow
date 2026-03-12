package com.softvent.finflow.transactions.paymentapplications.entity;

import com.softvent.finflow.transactions.invoices.entity.Invoice;
import com.softvent.finflow.transactions.receipts.entity.Receipt;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

/*
                               Table "public.payment_applications"
     Column     |           Type           | Collation | Nullable |           Default
----------------+--------------------------+-----------+----------+------------------------------
 paid           | bigint                   |           | not null | generated always as identity
 invid          | bigint                   |           | not null |
 rid            | bigint                   |           | not null |
 applied_amount | numeric(12,2)            |           | not null |
 applied_at     | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "payment_applications_pkey" PRIMARY KEY, btree (paid)
    "idx_payment_applications_invid" btree (invid)
    "idx_payment_applications_rid" btree (rid)
Foreign-key constraints:
    "fk_payment_application_invoice" FOREIGN KEY (invid) REFERENCES invoices(invid) ON DELETE RESTRICT
    "fk_payment_application_receipt" FOREIGN KEY (rid) REFERENCES receipts(rid) ON DELETE RESTRICT
 */

@Entity
@Table(name = "payment_applications")
public class PaymentApplication extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long paid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invid", nullable = false)
    public Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rid", nullable = false)
    public Receipt receipt;

    @Column(name = "applied_amount", nullable = false, precision = 12, scale = 2)
    public BigDecimal appliedAmount;

    @Column(name = "applied_at", nullable = false)
    public Instant appliedAt;

    @PrePersist
    public void prePersist() {
        this.appliedAt = Instant.now();
    }
}