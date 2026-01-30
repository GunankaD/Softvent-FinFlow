package com.softvent.finflow.transactionitems;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;

/*
                                  Table "public.transaction_items"
   Column   |     Type      | Collation | Nullable |                     Default
------------+---------------+-----------+----------+-------------------------------------------------
 tiid       | bigint        |           | not null | nextval('transaction_items_tiid_seq'::regclass)
 tid        | bigint        |           | not null |
 iid        | bigint        |           | not null |
 quantity   | numeric(12,2) |           | not null |
 rate       | numeric(12,2) |           | not null |
 line_total | numeric(12,2) |           | not null |
Indexes:
    "transaction_items_pkey" PRIMARY KEY, btree (tiid)

*/

@Entity
@Table(name = "transaction_items")
public class TransactionItem extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long tiid;

    @Column(nullable = false)
    public Long tid;   // transaction id (invoice)

    @Column(nullable = false)
    public Long iid;   // item id

    @Column(nullable = false)
    public BigDecimal quantity;

    @Column(nullable = false)
    public BigDecimal rate;

    @Column(name = "line_total", nullable = false)
    public BigDecimal lineTotal;
}
