package com.softvent.finflow.auth.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;

/*
                                       Table "public.refresh_tokens"
   Column   |           Type           | Collation | Nullable |                  Default
------------+--------------------------+-----------+----------+--------------------------------------------
 id         | bigint                   |           | not null | nextval('refresh_tokens_id_seq'::regclass)
 uid        | bigint                   |           | not null |
 token_hash | character varying(255)   |           | not null |
 expires_at | timestamp with time zone |           | not null |
 created_at | timestamp with time zone |           | not null | now()
 revoked    | boolean                  |           | not null | false
Indexes:
    "refresh_tokens_pkey" PRIMARY KEY, btree (id)
    "refresh_tokens_token_hash_key" UNIQUE CONSTRAINT, btree (token_hash)
Foreign-key constraints:
    "refresh_tokens_uid_fkey" FOREIGN KEY (uid) REFERENCES auth(uid) ON DELETE CASCADE
 */

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public Long uid;

    @Column(name = "token_hash", nullable = false, unique = true)
    public String tokenHash;

    @Column(name = "expires_at", nullable = false)
    public Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @Column(nullable = false)
    public boolean revoked = false;
}