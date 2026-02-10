package com.softvent.finflow.auth.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/*
                                        Table "public.password_reset"
   Column   |            Type             | Collation | Nullable |                  Default
------------+-----------------------------+-----------+----------+--------------------------------------------
 id         | bigint                      |           | not null | nextval('password_reset_id_seq'::regclass)
 emailid    | character varying(50)       |           | not null |
 token      | character varying(255)      |           | not null |
 expires_at | timestamp without time zone |           | not null |
Indexes:
    "password_reset_pkey" PRIMARY KEY, btree (id)
    "password_reset_token_key" UNIQUE CONSTRAINT, btree (token)
 */

@Entity
@Table(name = "password_reset")
public class PasswordReset extends PanacheEntityBase {

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;         // maps to id BIGSERIAL

    @Column(nullable = false, length = 50)
    public String emailid;

    @Column(nullable = false, length = 255, unique = true)
    public String token;

    @Column(name = "expires_at", nullable = false)
    public LocalDateTime expiresAt;
}
