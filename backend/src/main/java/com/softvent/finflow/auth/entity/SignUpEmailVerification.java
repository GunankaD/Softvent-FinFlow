package com.softvent.finflow.auth.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;

/*
                                           Table "public.signup_email_verification"
       Column       |           Type           | Collation | Nullable |                        Default
--------------------+--------------------------+-----------+----------+-------------------------------------------------------
 id                 | bigint                   |           | not null | nextval('signup_email_verification_id_seq'::regclass)
 email              | character varying(50)    |           | not null |
 otp_hash           | character varying(100)   |           | not null |
 expires_at         | timestamp with time zone |           | not null |
 verified           | boolean                  |           | not null | false
 verification_token | character varying(100)   |           |          |
 created_at         | timestamp with time zone |           | not null | now()
Indexes:
    "signup_email_verification_pkey" PRIMARY KEY, btree (id)
    "idx_signup_email_verification_email" btree (email)
 */


@Entity
@Table(name = "signup_email_verification")
public class SignUpEmailVerification extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 50)
    public String email;

    @Column(name = "otp_hash", nullable = false, length = 100)
    public String otpHash;

    @Column(name = "expires_at", nullable = false)
    public Instant expiresAt;

    @Column(nullable = false)
    public Boolean verified = false;

    @Column(name = "verification_token", length = 100)
    public String verificationToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
