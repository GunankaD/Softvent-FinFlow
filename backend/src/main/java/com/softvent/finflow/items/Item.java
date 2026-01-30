package com.softvent.finflow.items;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/*
                                          Table "public.items"
    Column    |            Type             | Collation | Nullable |              Default
--------------+-----------------------------+-----------+----------+------------------------------------
 iid          | bigint                      |           | not null | nextval('items_iid_seq'::regclass)
 icode        | character varying(30)       |           | not null |
 name         | character varying(100)      |           | not null |
 description  | text                        |           | not null |
 hsn_sac_code | character varying(10)       |           | not null |
 item_group   | character varying(50)       |           | not null |
 item_type    | character varying(20)       |           | not null |
 uom          | character varying(20)       |           | not null |
 is_bom       | boolean                     |           | not null | false
 created_at   | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "items_pkey" PRIMARY KEY, btree (iid)
    "items_icode_key" UNIQUE CONSTRAINT, btree (icode)

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

    @Column(nullable = false)
    public String description;

    @Column(name = "hsn_sac_code", nullable = false, length = 10)
    public String hsnSacCode;

    @Column(name = "item_group", nullable = false, length = 50)
    public String itemGroup;

    @Column(name = "item_type", nullable = false, length = 20)
    public String itemType;

    @Column(nullable = false, length = 20)
    public String uom;

    @Column(name = "is_bom", nullable = false)
    public Boolean isBom;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
}

