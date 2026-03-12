package com.softvent.finflow.transactions.invoiceitems.entity;

import com.softvent.finflow.transactions.invoices.entity.Invoice;
import com.softvent.finflow.items.entity.Item;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;


/*
                                  Table "public.invoice_items"
      Column      |          Type          | Collation | Nullable |           Default
------------------+------------------------+-----------+----------+------------------------------
 iviid            | bigint                 |           | not null | generated always as identity
 invid            | bigint                 |           | not null |
 iid              | bigint                 |           | not null |
 item_code        | character varying(30)  |           | not null |
 item_name        | character varying(100) |           | not null |
 quantity         | numeric(12,2)          |           | not null |
 rate             | numeric(12,2)          |           | not null |
 gst_rate         | numeric(5,2)           |           | not null |
 line_total       | numeric(12,2)          |           | not null |
 discount_percent | numeric(5,2)           |           |          | 0
Indexes:
    "invoice_items_pkey" PRIMARY KEY, btree (iviid)
    "idx_invoice_items_invid" btree (invid)
Foreign-key constraints:
    "fk_invoice_items_invoice" FOREIGN KEY (invid) REFERENCES invoices(invid) ON DELETE CASCADE
    "fk_invoice_items_item" FOREIGN KEY (iid) REFERENCES items(iid) ON DELETE RESTRICT
 */

@Entity
@Table(name = "invoice_items")
public class InvoiceItem extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long iviid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invid", nullable = false)
    public Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "iid", nullable = false)
    public Item item;

    @Column(name = "item_code", nullable = false, length = 30)
    public String itemCode;

    @Column(name = "item_name", nullable = false, length = 100)
    public String itemName;

    @Column(nullable = false, precision = 12, scale = 2)
    public BigDecimal quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    public BigDecimal rate;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    public BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    public BigDecimal gstRate;

    @Column(name="gst_amount", nullable=false, precision=12, scale=2)
    public BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    public BigDecimal lineTotal;

    @Column(name="line_amount", nullable=false, precision=12, scale=2)
    public BigDecimal lineAmount = BigDecimal.ZERO;


}