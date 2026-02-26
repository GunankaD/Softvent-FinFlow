package com.softvent.finflow.auth.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;

/*
                                           Table "public.auth"
      Column       |           Type           | Collation | Nullable |              Default
-------------------+--------------------------+-----------+----------+-----------------------------------
 uid               | bigint                   |           | not null | nextval('auth_uid_seq'::regclass)
 email             | character varying(50)    |           | not null |
 pwd_hash          | character varying(100)   |           | not null |
 created_at        | timestamp with time zone |           | not null | now()
 updated_at        | timestamp with time zone |           |          |
 last_logged_in_at | timestamp with time zone |           |          |
 is_deleted        | boolean                  |           | not null | false
Indexes:
    "auth_pkey" PRIMARY KEY, btree (uid)
*/

@Entity                     // tells Hibernate: this class = DB table
@Table(name = "auth")       // exact table name in Postgres
public class Auth extends PanacheEntityBase {

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long uid;         // maps to uid BIGSERIAL

    @Column(nullable = false, length = 50)
    public String email;   // maps to email VARCHAR(50)

    @Column(name = "pwd_hash", nullable = false, length = 100)
    public String pwdHash;   // maps to pwd_hash VARCHAR(100)

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @Column(name = "last_logged_in_at")
    public Instant lastLoggedInAt;

    @PrePersist // RUNS BEFORE INSERT COMMANDS
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
