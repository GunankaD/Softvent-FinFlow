package com.softvent.finflow.items.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;


import java.math.BigDecimal;
import java.time.Instant;

/*
                                          Table "public.items"
     Column      |           Type           | Collation | Nullable |              Default
-----------------+--------------------------+-----------+----------+------------------------------------
 iid             | bigint                   |           | not null | nextval('items_iid_seq'::regclass)
 icode           | character varying(30)    |           | not null |
 name            | character varying(100)   |           | not null |
 description     | text                     |           | not null |
 hsn_sac_code    | character varying(10)    |           | not null |
 item_type       | item_type_enum           |           | not null |
 uom             | uom_enum                 |           | not null |
 is_bom          | boolean                  |           | not null | false
 created_at      | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 stockable       | boolean                  |           | not null | true
 last_updated_at | timestamp with time zone |           |          |
 purchase_rate   | numeric(12,2)            |           |          |
 sales_rate      | numeric(12,2)            |           |          |
 gst_rate        | numeric(5,2)             |           | not null | 0
 gst_type        | character varying(20)    |           | not null | 'GST'::character varying
 is_active       | boolean                  |           | not null | true
 igid            | bigint                   |           | not null |
Indexes:
    "items_pkey" PRIMARY KEY, btree (iid)
    "idx_items_igid" btree (igid)
    "idx_items_is_active" btree (is_active)
    "idx_items_name" btree (name)
    "items_icode_key" UNIQUE CONSTRAINT, btree (icode)
Foreign-key constraints:
    "fk_items_group" FOREIGN KEY (igid) REFERENCES item_groups(igid) ON DELETE RESTRICT

*/

@Entity
@Table(name = "items")
public class Item extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long iid;

    @Column(nullable = false, unique = true, length = 30)
    public String icode;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String description;

    @Column(name="hsn_sac_code", nullable = false, length = 10)
    public String hsnSacCode;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name="item_type", nullable = false, columnDefinition = "item_type_enum")
    public ItemType itemType;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "uom_enum")
    public Uom uom;

    @Column(name="is_bom", nullable = false)
    public Boolean isBom = false;

    @Column(nullable = false)
    public Boolean stockable = true;

    @Column(name="is_active", nullable = false)
    public Boolean isActive = true;

    @Column(name="created_at", nullable = false)
    public Instant createdAt;

    @Column(name="last_updated_at", nullable = true)
    public Instant lastUpdatedAt;

    @Column(name="purchase_rate", precision = 12, scale = 2)
    public BigDecimal purchaseRate;

    @Column(name="sales_rate", precision = 12, scale = 2)
    public BigDecimal salesRate;

    @Column(name="gst_rate", nullable = false, precision = 5, scale = 2)
    public BigDecimal gstRate = BigDecimal.ZERO;

    @Column(name="gst_type", nullable = false, length = 20)
    public String gstType = "GST";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "igid", nullable = false)
    public ItemGroup itemGroup;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.lastUpdatedAt = Instant.now();
    }
}

