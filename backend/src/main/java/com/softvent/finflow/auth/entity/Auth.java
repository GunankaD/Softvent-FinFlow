package com.softvent.finflow.auth.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

/*
                                     Table "public.auth"
  Column  |          Type          | Collation | Nullable |              Default
----------+------------------------+-----------+----------+-----------------------------------
 uid      | bigint                 |           | not null | nextval('auth_uid_seq'::regclass)
 emailid  | character varying(50)  |           | not null |
 pwd_hash | character varying(100) |           | not null |
Indexes:
    "auth_pkey" PRIMARY KEY, btree (uid)
    "auth_pkey" PRIMARY KEY, btree (uid)
*/

@Entity                     // tells Hibernate: this class = DB table
@Table(name = "auth")       // exact table name in Postgres
public class Auth extends PanacheEntityBase {

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long uid;         // maps to uid BIGSERIAL

    @Column(nullable = false, length = 50)
    public String emailid;   // maps to emailid VARCHAR(50)

    @Column(name = "pwd_hash", nullable = false, length = 100)
    public String pwdHash;   // maps to pwd_hash VARCHAR(100)
}
