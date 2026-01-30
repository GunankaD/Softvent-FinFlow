package com.softvent.finflow.customers;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/*
                                          Table "public.customers"
    Column     |            Type             | Collation | Nullable |                Default
---------------+-----------------------------+-----------+----------+----------------------------------------
 cid           | bigint                      |           | not null | nextval('customers_cid_seq'::regclass)
 ccode         | character varying(20)       |           | not null |
 cname         | character varying(100)      |           | not null |
 address       | text                        |           | not null |
 city          | character varying(50)       |           | not null |
 state         | character varying(50)       |           | not null |
 country       | character varying(50)       |           | not null |
 pincode       | character varying(10)       |           | not null |
 mobile_number | character varying(15)       |           | not null |
 email_id      | character varying(100)      |           | not null |
 gst_no        | character varying(15)       |           | not null |
 pan_no        | character varying(10)       |           | not null |
 bank_name     | character varying(100)      |           | not null |
 branch_name   | character varying(100)      |           | not null |
 account_no    | character varying(20)       |           | not null |
 created_at    | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "customers_pkey" PRIMARY KEY, btree (cid)
    "customers_ccode_key" UNIQUE CONSTRAINT, btree (ccode)
*/

@Entity
@Table(name = "customers")
public class Customer extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long cid;

    @Column(nullable = false, unique = true, length = 20)
    public String ccode;

    @Column(nullable = false, length = 100)
    public String cname;

    @Column(nullable = false)
    public String address;

    @Column(nullable = false, length = 50)
    public String city;

    @Column(nullable = false, length = 50)
    public String state;

    @Column(nullable = false, length = 50)
    public String country;

    @Column(nullable = false, length = 10)
    public String pincode;

    @Column(name = "mobile_number", nullable = false, length = 15)
    public String mobileNumber;

    @Column(name = "email_id", nullable = false, length = 100)
    public String emailId;

    @Column(name = "gst_no", nullable = false, length = 15)
    public String gstNo;

    @Column(name = "pan_no", nullable = false, length = 10)
    public String panNo;

    @Column(name = "bank_name", nullable = false, length = 100)
    public String bankName;

    @Column(name = "branch_name", nullable = false, length = 100)
    public String branchName;

    @Column(name = "account_no", nullable = false, length = 20)
    public String accountNo;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
}
